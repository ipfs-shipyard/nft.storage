import * as Result from './result.js'
import * as Schema from '../gen/db/schema.js'
import * as IPFSURL from './ipfs-url.js'
import * as Cluster from './cluster.js'
import { fetchWebResource, timeout } from './net.js'
import { configure } from './config.js'
import { printURL } from './util.js'
import { script } from 'subprogram'
import * as DB from '../gen/db/index.js'

export const main = async () => await spawn(await configure())

/**
 * @typedef {Object} Config
 * @property {number} budget - Time budget
 * @property {number} fetchTimeout
 * @property {number} batchSize - Number of tokens in each import
 * @property {DB.Config} fauna - Database config
 * @property {Cluster.Config} cluster
 */

/**
 * @param {Config} config
 */
export const spawn = async config => {
  const deadline = Date.now() + config.budget
  while (deadline - Date.now() > 0) {
    console.log('🔍 Fetching resources linked referrenced by tokens')
    const resources = await fetchTokenResources(config)
    if (resources.length === 0) {
      return console.log('🏁 Finish, no more queued task were found')
    } else {
      console.log(`🤹 Spawn ${resources.length} tasks to process each resource`)
      const updates = await Promise.all(
        resources.map(resource => archive(config, resource))
      )
      console.log(`💾 Update ${updates.length} records in database`)
      await updateResources(config, updates)
      console.log(`✨ Processed batch of ${resources.length} assets`)
    }
  }
  console.log('⌛️ Finish, time is up')
}

/**
 * @typedef {{ _id:string, uri: string, ipfsURL?: string }} Resource
 *
 * @param {Object} options
 * @param {number} options.batchSize
 * @param {DB.Config} options.fauna
 * @returns {Promise<Resource[]>}
 */

const fetchTokenResources = async ({ fauna, batchSize }) => {
  const result = await DB.query(fauna, {
    findResources: [
      {
        where: {
          status: Schema.ResourceStatus.Queued,
        },
        _size: batchSize,
      },
      {
        data: {
          _id: 1,
          uri: 1,
          ipfsURL: 1,
        },
      },
    ],
  })

  const resources =
    /** @type {Resource[]} */
    (Result.value(result).findResources.data.filter(Boolean))

  return resources
}

/**
 * @param {Object} config
 * @param {DB.Config} config.fauna
 * @param {Schema.ResourceUpdate[]} updates
 */

const updateResources = async (config, updates) => {
  const result = await DB.mutation(config.fauna, {
    updateResources: [
      {
        input: {
          updates,
        },
      },
      {
        _id: 1,
      },
    ],
  })

  if (result.ok) {
    return result.value.updateResources?.map(r => r._id) || []
  } else {
    console.error(
      `💣 Attempt to update resource failed with ${result.error}, letting it crash`
    )
    throw result.error
  }
}

/**
 * @param {Object} config
 * @param {import('./cluster').Config} config.cluster
 * @param {number} config.fetchTimeout
 * @param {Resource} resource
 * @returns {Promise<Schema.ResourceUpdate>}
 */
const archive = async (config, resource) => {
  const { _id: id } = resource
  console.log(`🔬 (${id}) Parsing resource uri`)

  const urlResult = Result.fromTry(() => new URL(resource.uri))
  if (!urlResult.ok) {
    console.error(`🚨 (${id}) Failed to parse uri ${urlResult.error}`)
    return {
      id,
      status: Schema.ResourceStatus.URIParseFailed,
      statusText: String(urlResult.error),
    }
  }
  const url = urlResult.value
  console.log(`🧬 (${id}) Parsed URL ${printURL(url)}`)

  const ipfsURL = IPFSURL.asIPFSURL(url)
  ipfsURL && console.log(`🚀 (${id}) Derived IPFS URL ${ipfsURL}`)

  return ipfsURL
    ? await archiveIPFSResource(config, { ...resource, id, ipfsURL })
    : await archiveWebResource(config, { ...resource, id, url })
}

/**
 * @param {Object} config
 * @param {import('./cluster').Config} config.cluster
 * @param {number} config.fetchTimeout
 * @param {{id: string, uri: string, ipfsURL: IPFSURL.IPFSURL}} resource
 * @returns {Promise<Schema.ResourceUpdate>}
 */
const archiveIPFSResource = async (config, { ipfsURL, uri, id }) => {
  console.log(`📌 (${id}) Pin an IPFS resource ${ipfsURL}`)
  const pin = await Result.fromPromise(
    Cluster.pin(config.cluster, ipfsURL, {
      signal: timeout(config.fetchTimeout),
      metadata: {
        assetID: id,
        sourceURL: uri,
      },
    })
  )

  if (!pin.ok) {
    console.error(`🚨 (${id}) Failed to pin ${pin.error}`)
    return {
      id,
      ipfsURL: ipfsURL.href,
      status: Schema.ResourceStatus.PinRequestFailed,
      statusText: String(pin.error),
    }
  }
  const { cid } = pin.value

  console.log(`📝 (${id}) Link resource with content ${cid}`)
  return {
    id,
    ipfsURL: ipfsURL.href,
    status: Schema.ResourceStatus.ContentLinked,
    statusText: 'ContentLinked',
    cid,
  }
}

/**
 * @param {Object} config
 * @param {import('./cluster').Config} config.cluster
 * @param {number} config.fetchTimeout
 * @param {Resource & {id: string, url: URL}} resource
 * @returns {Promise<Schema.ResourceUpdate>}
 */
const archiveWebResource = async (config, { id, url }) => {
  console.log(`📡 (${id}) Fetching content from ${printURL(url)}`)
  const fetch = await Result.fromPromise(
    fetchWebResource(url, {
      signal: timeout(config.fetchTimeout),
    })
  )
  if (!fetch.ok) {
    console.error(
      `🚨 (${id}) Failed to fetch from ${printURL(url)} ${fetch.error}`
    )

    return {
      id,
      status: Schema.ResourceStatus.ContentFetchFailed,
      statusText: String(fetch.error),
    }
  }
  const content = fetch.value

  console.log(
    `📌 (${id}) Pin fetched content by uploading ${content.size} bytes`
  )

  const pin = await Result.fromPromise(
    Cluster.add(config.cluster, content, {
      signal: timeout(config.fetchTimeout),
      metadata: {
        id,
        sourceURL: url.protocol === 'data:' ? 'data:...' : url.href,
      },
    })
  )

  if (!pin.ok) {
    console.error(`🚨 (${id}) Failed to pin ${pin.error}`)
    return {
      id,
      status: Schema.ResourceStatus.PinRequestFailed,
      statusText: String(pin.error),
    }
  }

  const { cid } = pin.value

  console.log(`📝 (${id}) Link resource with content ${cid}`)

  return {
    id,
    status: Schema.ResourceStatus.ContentLinked,
    statusText: 'ContentLinked',
    cid,
  }
}

script({ ...import.meta, main })
