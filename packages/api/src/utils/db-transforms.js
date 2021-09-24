import * as cluster from '../cluster.js'

/**
 * Transform db response into NFT response
 *
 * @param {import('./db-client-types').UploadOutput} upload
 * @param {string} [sourceCid] - User input CID so we can return the same cid version back
 */
export function toNFTResponse(upload, sourceCid) {
  /** @type {import('../bindings').NFTResponse} */
  const nft = {
    cid: sourceCid || upload.source_cid,
    created: upload.inserted_at,
    type: upload.type,
    scope: upload.key ? upload.key.name : 'session',
    files: upload.files,
    size: upload.content.dag_size || 0,
    pin: {
      cid: sourceCid || upload.source_cid,
      created: upload.inserted_at,
      size: upload.content.dag_size || 0,
      status: upload.content.pin[0].status,
    },
    deals: upload.deals,
  }
  return nft
}

/**
 * Transform db response into Pin response
 *
 * @param {import('./db-client-types').UploadOutput} upload
 */
export function toPinsResponse(upload) {
  /** @type {import('../bindings').PinsResponse} */
  const rsp = {
    requestid: upload.source_cid,
    status: upload.content.pin[0].status,
    created: upload.inserted_at,
    pin: {
      cid: upload.source_cid,
      meta: upload.meta,
      name: upload.name,
      origins: upload.origins,
    },
    delegates: cluster.delegates(),
  }
  return rsp
}

/**
 * Transform db response into Check nft response
 *
 * @param {string} sourceCid
 * @param {import('./db-client-types').ContentOutput} content
 */
export function toCheckNftResponse(sourceCid, content) {
  /** @type {import('../bindings').CheckNFTResponse} */
  const rsp = {
    cid: sourceCid,
    pin: {
      cid: sourceCid,
      created: content?.inserted_at,
      size: content?.dag_size,
      status: content?.pins[0].status,
    },
    deals: content.deals,
  }
  return rsp
}
