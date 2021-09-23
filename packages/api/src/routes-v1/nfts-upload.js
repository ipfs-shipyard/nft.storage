import { HTTPError } from '../errors.js'
import * as cluster from '../cluster.js'
import { JSONResponse } from '../utils/json-response.js'
import { validate } from '../utils/auth-v1.js'
import { debug } from '../utils/debug.js'
import { toNFTResponse } from '../utils/db-transforms.js'

const log = debug('nfts-upload')
const LOCAL_ADD_THRESHOLD = 1024 * 1024 * 2.5

/**
 * @typedef {import('../bindings').NFT} NFT
 * @typedef {import('../bindings').NFTResponse} NFTResponse
 * @typedef {import('@nftstorage/ipfs-cluster').StatusResponse} StatusResponse
 */

/** @type {import('../utils/router.js').Handler} */
export async function uploadV1(event, ctx) {
  const { headers } = event.request
  const contentType = headers.get('content-type') || ''
  const { user, key, db } = await validate(event, ctx)

  /** @type {import('../utils/db-client-types').UploadOutput} */
  let upload
  let sourceCid

  if (contentType.includes('multipart/form-data')) {
    const form = await event.request.formData()
    // Our API schema requires that all file parts be named `file` and
    // encoded as binary, which is why we can expect that each part here is
    // a file (and not a stirng).
    const files = /** @type {File[]} */ (form.getAll('file'))

    const dirSize = files.reduce((total, f) => total + f.size, 0)
    const dir = await cluster.addDirectory(files, {
      local: dirSize > LOCAL_ADD_THRESHOLD,
    })
    const { cid, size } = dir[dir.length - 1]

    sourceCid = cid

    upload = await db.createUpload({
      account_id: user.id,
      content_cid: cid,
      source_cid: cid,
      key_id: key?.id,
      dag_size: size,
      mime_type: contentType,
      type: 'Multipart',
      files: files.map((f) => ({
        name: f.name,
        type: f.type,
      })),
    })
  } else {
    const blob = await event.request.blob()
    if (blob.size === 0) {
      throw new HTTPError('Empty payload', 400)
    }
    const isCar = contentType.includes('application/car')
    // Ensure car blob.type is set; it is used by the cluster client to set the foramt=car flag on the /add call.
    const content = isCar ? blob.slice(0, blob.size, 'application/car') : blob

    // cluster returns `bytes` rather than `size` when upload is a CAR.
    const { cid, size, bytes } = await cluster.add(content, {
      // When >2.5MB, use local add, because waiting for blocks to be sent to
      // other cluster nodes can take a long time. Replication to other nodes
      // will be done async by bitswap instead.
      local: blob.size > LOCAL_ADD_THRESHOLD,
    })

    sourceCid = cid
    const dagSize = size || bytes

    upload = await db.createUpload({
      mime_type: content.type,
      type: isCar ? 'Car' : 'Blob',
      content_cid: cid,
      source_cid: cid,
      dag_size: dagSize,
      account_id: user.id,
      files: [],
      key_id: key?.id,
    })
  }

  return new JSONResponse({ ok: true, value: toNFTResponse(upload, sourceCid) })
}
