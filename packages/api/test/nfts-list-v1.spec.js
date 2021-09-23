import assert from 'assert'
import { createClientWithUser, DBTestClient } from './scripts/helpers.js'
import { fixtures } from './scripts/fixtures.js'
import delay from 'delay'

describe('V1 - List NFTs', () => {
  it('should list 2 nfts with no params and validate deals', async () => {
    const client = await createClientWithUser()
    const cid1 = 'bafybeiaj5yqocsg5cxsuhtvclnh4ulmrgsmnfbhbrfxrc3u2kkh35mts4e'
    const cid2 = 'bafkreidnmgmp3xywh6voxfj2oiproduf6n77a4e4s6llajqxdmhvb7d5qq'
    await client.addPin({
      cid: cid1,
      name: 'test-file-deals',
    })

    await client.addPin({
      cid: cid2,
      name: 'test-file-no-deals',
    })

    await delay(300)
    const res = await fetch(`v1`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value } = await res.json()

    assert.equal(value[0].cid, cid2)
    assert.equal(value[0].pin.status, 'queued')
    assert.deepStrictEqual(value[0].deals, [])

    assert.equal(value[1].cid, cid1)
    assert.equal(value[1].pin.status, 'queued')
    assert.deepStrictEqual(value[1].deals, fixtures.dealsV0andV1)
  })

  it('should list 1 nft with param limit=1', async () => {
    const client = await createClientWithUser()
    const cid1 = 'bafybeiaj5yqocsg5cxsuhtvclnh4ulmrgsmnfbhbrfxrc3u2kkh35mts4e'
    const cid2 = 'bafkreidnmgmp3xywh6voxfj2oiproduf6n77a4e4s6llajqxdmhvb7d5qq'
    await client.addPin({
      cid: cid1,
      name: 'test-file-deals',
    })

    await client.addPin({
      cid: cid2,
      name: 'test-file-no-deals',
    })

    await delay(300)
    const res = await fetch(`v1?limit=1`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value } = await res.json()

    assert.ok(value.length === 1)
  })
  it('should list 0 nfts with date before any uploads', async () => {
    const date = new Date().toISOString()
    const client = await createClientWithUser()
    const cid1 = 'bafybeiaj5yqocsg5cxsuhtvclnh4ulmrgsmnfbhbrfxrc3u2kkh35mts4e'
    const cid2 = 'bafkreidnmgmp3xywh6voxfj2oiproduf6n77a4e4s6llajqxdmhvb7d5qq'
    await client.addPin({
      cid: cid1,
      name: 'test-file-deals',
    })

    await client.addPin({
      cid: cid2,
      name: 'test-file-no-deals',
    })

    await delay(300)
    const res = await fetch(`v1?before=${date}`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value } = await res.json()

    assert.ok(value.length === 0)
  })

  it('should list the default 10 nfts with no params', async () => {
    const client = await createClientWithUser()

    for (let i = 0; i < 10; i++) {
      await client.client.createUpload({
        account_id: client.userId,
        content_cid: `bafy${i}`,
        source_cid: `bafy${i}`,
        type: 'Blob',
      })
    }

    await delay(300)
    const res = await fetch(`v1`, {
      headers: { Authorization: `Bearer ${client.token}` },
    })
    const { ok, value } = await res.json()

    assert.ok(value.length === 10)
  })
})
