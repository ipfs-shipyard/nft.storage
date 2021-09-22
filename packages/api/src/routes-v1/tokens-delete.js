import { validate } from '../utils/auth-v1.js'
import { JSONResponse } from '../utils/json-response.js'

/** @type {import('../utils/router.js').Handler} */
export const tokensDeleteV1 = async (event, ctx) => {
  const { fauna } = await validate(event, ctx)
  const body = await event.request.json()

  if (body.id) {
    await fauna.deleteUserKey({
      id: body.id,
    })
  } else {
    throw new Error('Token id is required.')
  }

  return new JSONResponse({
    ok: true,
  })
}
