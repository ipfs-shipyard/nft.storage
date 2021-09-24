import * as cluster from '../cluster.js'
import { validate } from '../utils/auth-v1.js'
import { JSONResponse } from '../utils/json-response.js'
import { Validator } from '@cfworker/json-schema'
import { parseCidPinning } from '../utils/utils.js'
import { toPinsResponse } from '../utils/db-transforms.js'

/**
 * @typedef {import('../utils/db-client-types').ListUploadsOptions} ListUploadsOptions
 */

/** @type {import('../utils/router.js').Handler} */
export async function pinsListV1(event, ctx) {
  const { user, db } = await validate(event, ctx)
  const { searchParams } = new URL(event.request.url)
  const result = parseSearchParams(searchParams)

  if (result.error) {
    return new JSONResponse(result.error, { status: 400 })
  } else {
    const params = result.data

    // Query database
    try {
      const data = await db.listUploads(user.id, params)

      // Not found
      if (!data || data.length === 0) {
        return new JSONResponse(
          {
            error: {
              reason: 'NOT_FOUND',
              details: 'The specified resource was not found',
            },
          },
          { status: 404 }
        )
      }

      // Aggregate result into proper output
      let count = 0
      const results = []
      for (const upload of data) {
        if (upload.content.pin.length > 0) {
          count++
          results.push(toPinsResponse(upload))
        }
      }

      return new JSONResponse({ count, results })
    } catch (/** @type{any} */ err) {
      return new JSONResponse(
        {
          error: {
            reason: 'INTERNAL_SERVER_ERROR',
            details: err.message,
          },
        },
        { status: 500 }
      )
    }
  }
}

// Validation Schema
const validator = new Validator({
  type: 'object',
  required: ['status'],
  properties: {
    name: { type: 'string' },
    after: { type: 'string', format: 'date-time' },
    before: { type: 'string', format: 'date-time' },
    cid: { type: 'array', items: { type: 'string' } },
    limit: { type: 'number' },
    meta: { type: 'object' },
    match: {
      type: 'string',
      enum: ['exact', 'iexact', 'ipartial', 'partial'],
    },
    status: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['queued', 'pinning', 'pinned', 'failed'],
      },
    },
  },
})

/**
 *
 * @param {URLSearchParams} params
 */
function parseSearchParams(params) {
  /** @type {ListUploadsOptions} */
  const out = {}

  const cidParam = params.get('cid')
  if (cidParam) {
    const cids = cidParam.split(',')
    const cidsV1 = []
    for (const cid of cids) {
      const parsed = parseCidPinning(cid)
      if (parsed) {
        cidsV1.push(parsed.contentCid)
      } else {
        return {
          error: { reason: 'INVALID_CID', details: `Invalid cid ${cid}` },
          data: undefined,
        }
      }
    }
    out.cid = cidsV1
  }

  const nameParam = params.get('name')
  if (nameParam) {
    out.name = nameParam
  }

  const matchParam = params.get('match')
  if (matchParam) {
    out.match = /** @type {ListUploadsOptions["match"]} */ (matchParam)
  }

  const statusParam = params.get('status')
  if (statusParam) {
    out.status = /** @type {ListUploadsOptions["status"]}*/ (
      statusParam.split(',')
    )
  }

  const afterParam = params.get('after')
  if (afterParam) {
    out.after = afterParam
  }

  const beforeParam = params.get('before')
  if (beforeParam) {
    out.before = beforeParam
  }

  const limitParam = params.get('limit')
  if (limitParam && !Number.isNaN(Number(limitParam))) {
    out.limit = Number(limitParam)
  }

  const metaParam = params.get('meta')
  if (metaParam) {
    try {
      const parsed = JSON.parse(metaParam)
      out.meta = parsed
    } catch (err) {
      return {
        error: {
          reason: 'INVALID_META',
          details: 'Invalid json in the "meta" query parameter.',
        },
        data: undefined,
      }
    }
  }
  const result = validator.validate(out)

  if (result.valid) {
    return { data: out, error: undefined }
  } else {
    return {
      error: {
        reason: 'VALIDATION_ERROR',
        details: result.errors,
      },
      data: undefined,
    }
  }
}
