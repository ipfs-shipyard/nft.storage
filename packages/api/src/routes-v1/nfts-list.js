import { JSONResponse } from '../utils/json-response.js'
import { validate } from '../utils/auth-v1.js'
import { toNFTResponse } from '../utils/db-transforms.js'

/** @type {import('../utils/router.js').Handler} */
export async function nftListV1(event, ctx) {
  const { user, db } = await validate(event, ctx)
  const options = {
    limit: 10,
    before: new Date().toISOString(),
  }
  const { searchParams } = new URL(event.request.url)

  const limit = searchParams.get('limit')
  if (limit) {
    options.limit = parseInt(limit)
  }

  const before = searchParams.get('before')
  if (before) {
    options.before = before
  }

  const nfts = await db.listUploads(user.id, {
    limit: options.limit,
    before: options.before,
  })

  return new JSONResponse({
    ok: true,
    value: nfts?.map((n) => toNFTResponse(n)),
  })
}
