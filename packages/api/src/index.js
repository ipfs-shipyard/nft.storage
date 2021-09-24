import { Router } from './utils/router.js'
import { notFound } from './utils/utils.js'
import { HTTPError } from './errors.js'
import { cors, postCors } from './routes/cors.js'
import { check } from './routes/nfts-check.js'
import { upload } from './routes/nfts-upload.js'
import { store } from './routes/nfts-store.js'
import { status } from './routes/nfts-get.js'
import { remove } from './routes/nfts-delete.js'
import { list } from './routes/nfts-list.js'
import { tokensList } from './routes/tokens-list.js'
import { tokensCreate } from './routes/tokens-create.js'
import { tokensDelete } from './routes/tokens-delete.js'
import { pinsAdd } from './routes/pins-add.js'
import { pinsGet } from './routes/pins-get.js'
import { pinsList } from './routes/pins-list.js'
import { pinsReplace } from './routes/pins-replace.js'
import { pinsDelete } from './routes/pins-delete.js'
import { metrics } from './routes/metrics.js'
import { login } from './routes/login.js'
import { JSONResponse } from './utils/json-response.js'
import { debug } from './utils/debug.js'
import { getNFT } from './routes/get-nft.js'
import { tokensDeleteV1 } from './routes-v1/tokens-delete.js'
import { tokensCreateV1 } from './routes-v1/tokens-create.js'
import { tokensListV1 } from './routes-v1/tokens-list.js'
import { loginV1 } from './routes-v1/login.js'
import { uploadV1 } from './routes-v1/nfts-upload.js'
import { statusV1 } from './routes-v1/nfts-get.js'
import { checkV1 } from './routes-v1/nfts-check.js'
import { nftDeleteV1 } from './routes-v1/nfts-delete.js'
import { nftListV1 } from './routes-v1/nfts-list.js'
import { nftStoreV1 } from './routes-v1/nfts-store.js'
import { pinsAddV1 } from './routes-v1/pins-add.js'
import { pinsDeleteV1 } from './routes-v1/pins-delete.js'
import { pinsGetV1 } from './routes-v1/pins-get.js'
import { pinsListV1 } from './routes-v1/pins-list.js'
import {
  withMode,
  R,
  RW,
  getMaintenanceMode,
} from './middleware/maintenance.js'

const log = debug('router')

const r = new Router({
  onError(req, err, { sentry }) {
    log(err)
    return HTTPError.respond(err, { sentry })
  },
})

// Monitoring
r.add('get', '/metrics', withMode(metrics, R))

// CORS
r.add('options', '*', cors)

// Auth
r.add('post', '/login', withMode(login, R), [postCors])

// Version
r.add('get', '/version', (event) => {
  return new JSONResponse({
    version: VERSION,
    commit: COMMITHASH,
    branch: BRANCH,
    mode: getMaintenanceMode(),
  })
})

// Remote Pinning API
r.add('get', '/api/pins', withMode(pinsList, R), [postCors])
r.add('get', '/api/pins/:requestid', withMode(pinsGet, R), [postCors])
r.add('post', '/api/pins', withMode(pinsAdd, RW), [postCors])
r.add('post', '/api/pins/:requestid', withMode(pinsReplace, RW), [postCors])
r.add('delete', '/api/pins/:requestid', withMode(pinsDelete, RW), [postCors])

r.add('post', '/pins', withMode(pinsAdd, RW), [postCors])
r.add('get', '/pins', withMode(pinsList, R), [postCors])
r.add('get', '/pins/:requestid', withMode(pinsGet, R), [postCors])
r.add('post', '/pins/:requestid', withMode(pinsReplace, RW), [postCors])
r.add('delete', '/pins/:requestid', withMode(pinsDelete, RW), [postCors])

// V1 routes
r.add('post', '/v1/login', withMode(loginV1, R), [postCors])

r.add('get', '/v1/pins', withMode(pinsListV1, R), [postCors])
r.add('get', '/v1/pins/:requestid', withMode(pinsGetV1, R), [postCors])
r.add('post', '/v1/pins', withMode(pinsAddV1, RW), [postCors])
r.add('delete', '/v1/pins/:requestid', withMode(pinsDeleteV1, RW), [postCors])

r.add('get', '/v1', withMode(nftListV1, R), [postCors])
r.add('get', '/v1/:cid', withMode(statusV1, R), [postCors])
r.add('post', '/v1/upload', withMode(uploadV1, RW), [postCors])
r.add('post', '/v1/store', withMode(nftStoreV1, RW), [postCors])
r.add('delete', '/v1/:cid', withMode(nftDeleteV1, RW), [postCors])

r.add('get', '/v1/check/:cid', withMode(checkV1, R), [postCors])

r.add('get', '/v1/internal/tokens', withMode(tokensListV1, R), [postCors])
r.add('post', '/v1/internal/tokens', withMode(tokensCreateV1, RW), [postCors])
r.add('delete', '/v1/internal/tokens', withMode(tokensDeleteV1, RW), [postCors])

// Public API
r.add('get', '/api', withMode(list, R), [postCors])
r.add('get', '/api/check/:cid', withMode(check, R), [postCors])
r.add('get', '/api/:cid', withMode(status, R), [postCors])
r.add('post', '/api/upload', withMode(upload, RW), [postCors])
r.add('delete', '/api/:cid', withMode(remove, RW), [postCors])

r.add('get', '', withMode(list, R), [postCors])
r.add('get', '/check/:cid', withMode(check, R), [postCors])
r.add('get', '/:cid', withMode(status, R), [postCors])
r.add('post', '/upload', withMode(upload, RW), [postCors])
r.add('post', '/store', withMode(store, RW), [postCors])
r.add('delete', '/:cid', withMode(remove, RW), [postCors])

// Private API
r.add('get', '/internal/tokens', withMode(tokensList, R), [postCors])
r.add('post', '/internal/tokens', withMode(tokensCreate, RW), [postCors])
r.add('delete', '/internal/tokens', withMode(tokensDelete, RW), [postCors])
r.add('get', '/internal/list2', withMode(getNFT, R), [postCors])

r.add('all', '*', notFound)
addEventListener('fetch', r.listen.bind(r))
