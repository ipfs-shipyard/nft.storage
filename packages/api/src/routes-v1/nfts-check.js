import { JSONResponse } from '../utils/json-response.js'
import { HTTPError } from '../errors.js'
import { secrets, database } from '../constants.js'
import { DBClient } from '../utils/db-client'
import { parseCid } from '../utils/utils.js'
import { toCheckNftResponse } from '../utils/db-transforms.js'

const db = new DBClient(database.url, secrets.database)

/** @type {import('../utils/router.js').Handler} */
export const checkV1 = async (event, { params }) => {
  const cid = parseCid(params.cid)
  const content = await db.getContent(cid.contentCid)

  if (content) {
    return new JSONResponse({
      ok: true,
      value: toCheckNftResponse(cid.sourceCid, content),
    })
  } else {
    throw new HTTPError('NFT not found', 404)
  }
}
