import * as ERC721 from '../gen/erc721/index.js'
import * as Hasura from './hasura.js'

import {
  erc721ImportToNFTEndpoint,
  subgraphTokenToERC721ImportNFT,
} from './ingest/transforms.js'
import { exponentialBackoff, maxRetries, retry } from './retry.js'

import { TransformStream } from './stream.js'
import { configure } from './config.js'
import { lastScrapeId } from './ingest/cursor.js'
import { script } from 'subprogram'
import { setTimeout as sleep } from 'timers/promises'

/**
 * @typedef {import('./ingest').ERC721ImportNFT} ERC721ImportNFT
 */

/**
 * @typedef { Object } Config
 * @property { ERC721.Config } config.erc721
 * @property { Hasura.Config } config.hasura
 * @property { number } config.ingestRetryThrottle
 * @property { number } config.ingestHighWatermark
 * @property { number } config.ingestBatchSize
 * @property { number } config.ingestScraperRetryLimit
 * @property { number } config.ingestScraperRetryInterval
 * @property { number } config.ingestScraperRetryMaxInterval
 * @property { number } config.ingestWriterRetryLimit
 * @property { number } config.ingestWriterRetryInterval
 * @property { number } config.ingestWriterRetryMaxInterval
 */

/**
 * @typedef {{
 *  tokens: ERC721ImportNFT[]
 * }} NFTSSubGraphResultValue
 *
 * @typedef {{
 *  ok: Boolean
 *  value: NFTSSubGraphResultValue
 *  done: Boolean
 * }} NFTSSubgraphResult
 *
 */

/**
 * Returns a query for the subgraph that provisions the correct batch size
 * and starts at the correct NFT Id (the cursor).
 * If this is the first query, starting this module for the first time, the cursor
 * will be the id of whatever record was written last in our database.
 * @param {Config} config
 * @returns {Promise<ERC721.schema.QueryRequest>}
 */
const nextSubgraphQuery = async (config) => {
  const query = {
    first: config.ingestBatchSize,
    where: { tokenURI_not: '', id_gt: await lastScrapeId(config) },
  }
  const erc721ResultDefinition = {
    id: 1,
    tokenID: 1,
    tokenURI: 1,
    mintTime: 1,
    blockNumber: 1,
    blockHash: 1,
    contract: {
      id: 1,
      name: 1,
      symbol: 1,
      supportsEIP721Metadata: 1,
    },
    owner: {
      id: 1,
    },
  }
  return {
    tokens: [query, erc721ResultDefinition],
  }
}

/**
 * Calls Subgraph and returns a batch of NFT records.
 * Hydrates the inbox.
 * @param { Config } config
 * @returns { Promise<ERC721ImportNFT[]> }
 */
async function fetchNextNFTBatch(config) {
  try {
    const query = await nextSubgraphQuery(config)
    const nftsResult = await ERC721.query(config.erc721, query)
    if (nftsResult.ok === false) {
      console.error(nftsResult)
      throw new Error(JSON.stringify(nftsResult))
    }
    const { tokens } = nftsResult?.value || []
    return tokens.map(subgraphTokenToERC721ImportNFT)
  } catch (err) {
    console.error(`🚨 Something unexpected happened scraping nfts`, err)
    throw err
  }
}

/**
 * Persist a single NFT Record that was imported.
 * Drains the inbox.
 * @param { Config } config
 * @param { ERC721ImportNFT } erc721Import
 */
async function writeScrapedRecord(config, erc721Import) {
  return Hasura.mutation(config.hasura, {
    ingest_erc721_token: [
      {
        args: erc721ImportToNFTEndpoint(erc721Import),
      },
      {
        id: true,
      },
    ],
  })
}

/**
 * Drains records sequentially from the inbox
 * @param { Config } config
 * @param { ReadableStream<ERC721ImportNFT>} readable
 * @return { Promise<never> }
 */
async function writeFromInbox(config, readable) {
  const reader = readable.getReader()
  while (true) {
    const nextImport = await reader.read()
    try {
      /**
       * We will attempt to write an import record that has been scraped.
       * If the write is a failure, we will retry, to account for intermittent outages
       * If failure occurs several times and for long enough, we throw an error.
       * We write from the Transform stream, one record at a time, as quickly as we can.
       * this makes cursor-tracking on restart very simple and prevents lossy data.
       * this stream should typically never be closed,
       * unless the writeable end has unexpectely aborted due to an error
       */
      if (nextImport.done) {
        console.error(`The Ingestion Stream unexpectedly completed`)
        reader.cancel()
      } else {
        await retry(
          async () => await writeScrapedRecord(config, nextImport.value),
          [
            maxRetries(config.ingestWriterRetryLimit),
            exponentialBackoff(
              config.ingestWriterRetryInterval,
              config.ingestWriterRetryMaxInterval
            ),
          ]
        )
      }
    } catch (err) {
      console.log('Last NFT', nextImport)
      console.error(`Something went wrong when writing scraped nfts`, err)
      throw err
    }
  }
}

/**
 * Inserts nft records by batches into the inbox.
 * @param { Config } config
 * @param { WritableStream<ERC721ImportNFT>} writeable
 * @return { Promise<never> }
 */
async function readIntoInbox(config, writeable) {
  const writer = writeable.getWriter()

  while (true) {
    let scrape = []
    try {
      /*
       * Attempt to call subgraph, and make a scrape.
       * if something goes wrong, we can retry, each time waiting longer.
       * This is to account for intermittent 'yellow flag' failures, like
       * network temporary outages.
       * Eventually after enough failures, we can actually throw
       */
      scrape = await retry(
        async () => fetchNextNFTBatch(config),
        [
          maxRetries(config.ingestScraperRetryLimit),
          exponentialBackoff(
            config.ingestScraperRetryInterval,
            config.ingestScraperRetryMaxInterval
          ),
        ]
      )
      // you scraped successfully, got nothing.
      // you're caught up. Retry later
      if (scrape.length == 0) {
        await sleep(config.ingestRetryThrottle)
      } else {
        await writer.ready
        for (const nft of scrape) {
          writer.write(nft)
          //Continusiusly update the in-memory cursor
          lastScrapeId(config, nft.id)
        }
      }
    } catch (err) {
      console.error(`Something unexpected happened scraping nfts`, err)
      writer.abort(err)
      throw err
    }
  }
}

/**
 * Spawn process and create a TransformStream to store and write from.
 * Storing and writing are independent processes running asynchronously
 * Backpressure is managed by the Transform Stream's high Watermark.
 *
 * The TransformStream is 'the inbox'.
 * @param {Config} config
 */
async function spawn(config) {
  console.log(`⏲️ Begin Scraping the Ethereum Blockchain.`)
  /**
   * @type { TransformStream<ERC721ImportNFT> }
   */
  const inbox = new TransformStream(
    {},
    {
      highWaterMark: config.ingestHighWatermark,
    }
  )
  const reader = readIntoInbox(config, inbox.writable)
  const writer = writeFromInbox(config, inbox.readable)

  await Promise.all([reader, writer])
  return undefined
}

export const main = async () => await spawn(await configure())

script({ ...import.meta, main })
