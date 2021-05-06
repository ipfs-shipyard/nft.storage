import { JSONResponse } from '../utils/json-response'
import { loginOrRegister } from './../utils/auth'

/** @type {import('../utils/router').Handler} */
export async function login(event) {
  const data = await event.request.json()
  const auth = await loginOrRegister(event, data)
  return new JSONResponse({
    ok: true,
    value: auth,
  })
}
