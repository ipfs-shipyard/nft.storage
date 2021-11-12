import Toucan from 'toucan-js'
import { ErrorCode as MagicErrors } from '@magic-sdk/admin'
import { JSONResponse } from './utils/json-response.js'
import { DBError } from './utils/db-client.js'

/** @typedef {{ code: string }} Coded */

export class HTTPError extends Error {
  /**
   *
   * @param {string} message
   * @param {number} [status]
   */
  constructor(message, status = 500) {
    super(message)
    this.name = 'HTTPError'
    this.status = status
  }
  /**
   * @param {string} message
   * @param {number} [status]
   * @returns {never}
   */
  static throw(message, status) {
    throw new this(message, status)
  }

  /**
   * @param {Error & {status?: number;code?: string;}} err
   * @param {{sentry: Toucan, req: Request}} ctx
   */
  static respond(err, { sentry, req }) {
    const { message, code, status } = maybeCapture(err, { sentry, req })
    return status === 302
      ? new Response(null, {
          status: 302,
          headers: { location: 'https://nft.storage/api-docs/' },
        })
      : new JSONResponse(
          {
            ok: false,
            error: { code, message },
          },
          {
            status,
          }
        )
  }
}

/**
 * Pass me an error and I might send it to sentry if it's important. Either way
 * I'll give you back a HTTPError with a user friendly error message and code.
 *
 * @param {any} err
 * @param {{ sentry: Toucan, req: Request }} ctx
 * @returns {HTTPError & Coded} A HTTPError with an error code.
 */
export function maybeCapture(err, { sentry, req }) {
  let code = err.code || 'HTTP_ERROR'
  let message = err.message
  let status = err.status || 500

  switch (err.code) {
    case ErrorUserNotFound.CODE:
    case ErrorTokenNotFound.CODE:
    case ErrorInvalidCid.CODE:
      break
    case DBError.CODE:
      message = 'Database error'
      sentry.captureException(err)
      break
    // Magic SDK errors
    case MagicErrors.TokenExpired:
      status = 401
      message = 'API Key has expired.'
      break
    case MagicErrors.ExpectedBearerString:
      const contentType = req.headers.get('Content-Type')
      if (!contentType || contentType === 'text/html') {
        status = 302
      } else status = 401
      message =
        'API Key is missing, make sure the `Authorization` header has a value in the following format `Bearer {api key}`.'
      break
    case MagicErrors.MalformedTokenError:
      status = 401
      message = 'API Key is malformed or failed to parse.'
      break
    case MagicErrors.TokenCannotBeUsedYet:
    case MagicErrors.IncorrectSignerAddress:
    case MagicErrors.FailedRecoveryProof:
    case MagicErrors.ApiKeyMissing:
      status = 401
      code = 'AUTH_ERROR'
      message = 'Authentication failed.'
      sentry.captureException(err)
      break
    case MagicErrors.ServiceError:
      status = 500
      code = 'SERVER_ERROR'
      sentry.captureException(err)
      break
    default:
      // catch all server errors
      if (status >= 500) {
        code = err.name
        message = err.message
        sentry.captureException(err)
      }
      break
  }

  return Object.assign(new HTTPError(message, status), { code })
}

export class ErrorUserNotFound extends Error {
  constructor(msg = 'User not found.') {
    super(msg)
    this.name = 'UserNotFound'
    this.status = 401
    this.code = ErrorUserNotFound.CODE
  }
}
ErrorUserNotFound.CODE = 'ERROR_USER_NOT_FOUND'

export class ErrorTokenNotFound extends Error {
  constructor(msg = 'API Key not found.') {
    super(msg)
    this.name = 'TokenNotFound'
    this.status = 401
    this.code = ErrorTokenNotFound.CODE
  }
}
ErrorTokenNotFound.CODE = 'ERROR_TOKEN_NOT_FOUND'

export class ErrorInvalidCid extends Error {
  /**
   * @param {string} cid
   */
  constructor(cid) {
    super(`Invalid CID: ${cid}`)
    this.name = 'InvalidCid'
    this.status = 400
    this.code = ErrorInvalidCid.CODE
  }
}
ErrorInvalidCid.CODE = 'ERROR_INVALID_CID'
