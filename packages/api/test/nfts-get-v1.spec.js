import assert from 'assert'
import { createClientWithUser, DBTestClient } from './scripts/helpers.js'
import { fixtures } from './scripts/fixtures.js'

describe('V1 - Get NFT', () => {
  /** @type{DBTestClient} */
  let client

  before(async () => {
    client = await createClientWithUser()
  })

  it('should return proper response for cid v1', async () => {
    const cid = 'bafybeiaj5yqocsg5cxsuhtvclnh4ulmrgsmnfbhbrfxrc3u2kkh35mts4e'
    await client.addPin({
      cid,
      name: 'test-file11',
    })

    const res = await fetch(`v1/${cid}`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value } = await res.json()

    assert.equal(value.cid, cid)
    assert.equal(value.pin.status, 'queued')
    assert.deepStrictEqual(value.deals, fixtures.dealsV0andV1)
  })

  it('should return proper response for cid v0', async () => {
    const cid = 'QmP1QyqiRtQLbGBr5hLVX7NCmrJmJbGdp45x6DnPssMB9i'
    await client.addPin({
      cid,
      name: 'test-file-cid-v0',
    })

    const res = await fetch(`v1/${cid}`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value } = await res.json()
    assert.equal(value.cid, cid)
    assert.equal(value.pin.status, 'queued')
    assert.deepStrictEqual(value.deals, fixtures.dealsV0andV1)
  })

  it('should error on invalid cid', async () => {
    const cid = 'asdhjkahsdja'
    const res = await fetch(`v1/${cid}`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value, error } = await res.json()

    assert.equal(ok, false)
    assert.deepStrictEqual(error, {
      code: 'ERROR_INVALID_CID',
      message: `Invalid CID: ${cid}`,
    })
  })

  it('should error on not found', async () => {
    const cid = 'bafybeia22kh3smc7p67oa76pcleaxp4u5zatsvcndi3xrqod5vtxq5avpa'
    const res = await fetch(`v1/${cid}`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value, error } = await res.json()

    assert.equal(ok, false)
    assert.deepStrictEqual(error, {
      code: 'HTTP_ERROR',
      message: `NFT not found`,
    })
  })
})
