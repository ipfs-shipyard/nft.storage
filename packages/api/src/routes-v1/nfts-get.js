import { HTTPError } from '../errors.js'
import { JSONResponse } from '../utils/json-response.js'
import { validate } from '../utils/auth-v1.js'
import { parseCid } from '../utils/utils.js'
import { toNFTResponse } from '../utils/db-transforms.js'

/**
 * @typedef {import('../bindings').Deal} Deal
 */

/** @type {import('../utils/router.js').Handler} */
export const statusV1 = async (event, ctx) => {
  const { params } = ctx
  const { user, db } = await validate(event, ctx)
  const cid = parseCid(params.cid)
  const nft = await db.getUpload(cid.contentCid, user.id)
  if (nft) {
    return new JSONResponse({
      ok: true,
      value: toNFTResponse(nft, cid.sourceCid),
    })
  } else {
    throw new HTTPError('NFT not found', 404)
  }
}
