import assert from 'assert'
import { CID } from 'multiformats'
import * as Token from '../../client/src/token.js'
import { createTestUser, rawClient } from './scripts/helpers.js'

describe('V1 - /store', () => {
  it('should store image', async () => {
    const { token, userId } = await createTestUser()

    const trick =
      'ipfs://bafyreiemweb3jxougg7vaovg7wyiohwqszmgwry5xwitw3heepucg6vyd4'
    const metadata = {
      name: 'name',
      description: 'stuff',
      image: new File(['fake image'], 'cat.png', { type: 'image/png' }),
      properties: {
        extra: 'meta',
        trick,
        src: [
          new File(['hello'], 'hello.txt', { type: 'text/plain' }),
          new Blob(['bye']),
        ],
      },
    }
    const body = Token.encode(metadata)

    const res = await fetch('/v1/store', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    assert(res, 'Server responded')
    assert(res.ok, 'Server response ok')
    const { ok, value } = await res.json()
    const result = value
    const cid = CID.parse(result.ipnft)
    assert.strictEqual(cid.version, 1)

    assert.deepStrictEqual(
      result,
      {
        ipnft: 'bafyreicnwbboevx6g6fykitf4nebz2kqgkqz35qvlnlcgfulhrris66m6i',
        url: 'ipfs://bafyreicnwbboevx6g6fykitf4nebz2kqgkqz35qvlnlcgfulhrris66m6i/metadata.json',
        data: {
          name: 'name',
          description: 'stuff',
          properties: {
            extra: 'meta',
            trick:
              'ipfs://bafyreiemweb3jxougg7vaovg7wyiohwqszmgwry5xwitw3heepucg6vyd4',
            src: [
              'ipfs://bafybeifvbzj3rk2unsdhbq6wisbcblekwf2pjpgjmppv6ejplsyyhdn4ym/hello.txt',
              'ipfs://bafybeibgaiw7jgzvbgjk3xu26scmbzedgywpkfgorrb7bfmu2hvpihzi5i/blob',
            ],
          },
          image:
            'ipfs://bafybeieb43wq6bqbfmyaawfmq6zuycdq4bo77zph33zxx26wvquth3qxau/cat.png',
        },
      },
      'response structure'
    )

    const { data, error } = await rawClient
      .from('upload')
      .select(
        '*, content(cid, dag_size, pin:pin_view(content_cid, status, service))'
      )
      .match({ content_cid: result.ipnft, account_id: userId })
      .single()

    if (error) {
      throw new Error(JSON.stringify(error))
    }

    assert.strictEqual(data.type, 'Nft', 'nft type')
    assert.strictEqual(data.content.dag_size, 324, 'nft size')
    assert.deepStrictEqual(data.content.pin, [
      {
        content_cid:
          'bafyreicnwbboevx6g6fykitf4nebz2kqgkqz35qvlnlcgfulhrris66m6i',
        status: 'queued',
        service: 'IpfsCluster',
      },
      {
        content_cid:
          'bafyreicnwbboevx6g6fykitf4nebz2kqgkqz35qvlnlcgfulhrris66m6i',
        status: 'queued',
        service: 'Pinata',
      },
    ])
  })
})
