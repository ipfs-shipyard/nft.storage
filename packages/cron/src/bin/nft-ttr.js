#!/usr/bin/env node

import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fetch from '@web-std/fetch'
import { measureNftTimeToRetrievability } from '../jobs/measureNftTimeToRetrievability.js'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { EnvironmentLoader } from 'safe-env-vars'
import { ConsoleLog, JSONLogger } from '../lib/log.js'
import process from 'process'
import { RandomImage, RandomImageBlob } from '../lib/random.js'

const env = new EnvironmentLoader()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** @ts-ignore */
global.fetch = fetch

/**
 * @param {string[]} argv
 * @param {object} [options]
 * @param {import('../lib/log.js').LogFunction} options.log
 */
export async function main(argv, options = { log: JSONLogger(ConsoleLog) }) {
  const [command, ...commandArgv] = argv
  /**
   * @param  {string[]} commandArgv
   */
  const measureArgs = async (...commandArgv) => {
    const commandArgs = await yargs(commandArgv).options({
      url: {
        type: 'string',
        default: 'https://nft.storage',
      },
      metricsPushGateway: {
        type: 'string',
      },
      minImageSizeBytes: {
        type: 'number',
        default: 1000,
      },
    }).argv
    /** @type {AsyncIterable<Blob>} */
    const images = (async function* () {
      let count = 1
      while (count--) {
        /** @type {Blob} */
        const blob = await RandomImageBlob(
          RandomImage({
            bytes: {
              min: commandArgs.minImageSizeBytes,
            },
          })
        )
        yield blob
      }
    })()
    return {
      ...commandArgs,
      log: options.log,
      images,
    }
  }
  switch (command) {
    case 'measure':
      await measureNftTimeToRetrievability(
        {
          ...(await measureArgs(...commandArgv)),
        },
        {
          nftStorageToken: env.string.get('NFT_STORAGE_API_KEY'),
          metricsPushGatewayBasicAuthUser: env.optional.string.get(
            'PUSHGATEWAY_BASIC_AUTH'
          ),
        }
      )
      break
    default:
      throw new Error(`unexpected command ${command}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  dotenv.config({ path: path.join(__dirname, '../../../../.env') })
  main(hideBin(process.argv))
}
