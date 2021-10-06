import * as IPFSURL from './ipfs-url.js'
import { importer } from 'ipfs-unixfs-importer'

/**
 * @typedef {Object} Config
 * @property {URL} url
 * @property {string} secret
 */

/**
 * Returns content for the given ipfs:// url from the remote ipfs node that
 * corresponds to provided configuration. If `v0` option is true request will
 * be use CIDv0 as opposed to CIDv1 (that will be in the URL). AbortSignal may
 * be provided to abort request if necessary.
 *
 * @param {Config} config
 * @param {import('./ipfs-url').IPFSURL} url
 * @param {Object} [options]
 * @param {boolean} [options.v0=false]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<Blob>}
 */
export const cat = async (config, url, { v0 = false, signal } = {}) => {
  const path = v0
    ? IPFSURL.formatIPFSPathWithCIDv0(url)
    : IPFSURL.formatIPFSPath(url)
  const { href } = new URL(`/api/v0/cat?arg=${path}`, config.url)

  const response = await fetch(href, {
    method: 'POST',
    headers: { Authorization: `Basic ${config.secret}` },
    signal,
  })

  if (response.ok) {
    return await response.blob()
  } else {
    throw new Error(
      `Fetch error: Status ${response.status} ${response.statusText}`
    )
  }
}

/**
 * @typedef {import('multiformats').CID} CID
 * @param {Blob} content
 * @returns {Promise<{cid:CID, size:number}>}
 */
export const importBlob = async (content) => {
  // @ts-expect-error - 'Block' instance is not a valid 'Blockstore'
  const results = importer([{ content }], new Block(), {
    onlyHash: true,
    cidVersion: 1,
    rawLeaves: true,
  })
  for await (const result of results) {
    return result
  }
  throw new Error(`Import failed`)
}
