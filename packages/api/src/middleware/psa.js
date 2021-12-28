import { maybeCapture, ErrorPinningUnauthorized } from '../errors.js'
import { JSONResponse } from '../utils/json-response.js'
import { validate } from '../utils/auth.js'
import { psaAllow } from '../constants.js'

/** @typedef {import('../bindings').Handler} Handler */

/**
 * Catch an error and respond with a response as required by the PSA spec,
 * logging the actual error with sentry.
 *
 * @param {Handler} handler
 * @returns {Handler}
 */
export function withPsaErrorHandler(handler) {
  return async (event, ctx) => {
    try {
      return await handler(event, ctx)
    } catch (err) {
      const { status } = maybeCapture(err, ctx)
      return new JSONResponse(
        {
          error: {
            reason: 'INTERNAL_SERVER_ERROR',
            details: 'An unexpected error occurred.',
          },
        },
        { status }
      )
    }
  }
}

/**
 * Verify that the authenticated request is for a user who is authorized to pin.
 *
 * @param {Handler} handler
 * @returns {Handler}
 */
export function withPinningAuthorized(handler) {
  return async (event, ctx) => {
    // TODO: we need withAuth middleware so we don't have to do this twice
    const { user } = await validate(event, ctx)
    const authorized = psaAllow.includes(String(user.id)) || psaAllow[0] === '*'
    if (!authorized) {
      throw new ErrorPinningUnauthorized()
    }
    return handler(event, ctx)
  }
}
