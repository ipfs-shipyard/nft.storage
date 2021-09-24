import { PostgrestClient, PostgrestQueryBuilder } from '@supabase/postgrest-js'

/**
 * @typedef {import('./db-types').definitions} definitions
 */

export class DBClient {
  /**
   * DB client constructor
   *
   * @param {string} url
   * @param {string} token
   */
  constructor(url, token) {
    this.client = new PostgrestClient(url, {
      headers: {
        apikey: token,
      },
    })
  }

  /**
   * Upsert user
   *
   * @param {import('./db-client-types').UpsertUserInput} account
   */
  upsertUser(account) {
    /**@type {PostgrestQueryBuilder<definitions['account']>} */
    const query = this.client.from('account')

    return query.upsert(account)
  }

  /**
   * Get user by magic.link or old github id
   *
   * @param {string} id
   */
  getUser(id) {
    /** @type {PostgrestQueryBuilder<import('./db-client-types').UserOutput>} */
    const query = this.client.from('account')

    let select = query
      .select(
        `
    id,
    magic_link_id,
    github_id,
    keys:auth_key_account_id_fkey(account_id,id,name,secret)
    `
      )
      .or(`magic_link_id.eq.${id},github_id.eq.${id}`)

    return select.single()
  }

  /**
   * Create upload with content and pins
   *
   * @param {import('./db-client-types').CreateUploadInput} data
   * @returns
   */
  async createUpload(data) {
    const rsp = await this.client.rpc('upload_fn', {
      data,
    })
    if (rsp.error) {
      throw new Error(JSON.stringify(rsp.error))
    }

    const upload = await this.getUpload(data.content_cid, data.account_id)
    if (upload) {
      return upload
    }
    throw new Error('Error getting new upload.')
  }

  uploadQuery = `
        *,
        user:account(id, magic_link_id),
        key:auth_key(name),
        content(dag_size, pin(status, service))`

  /**
   * Get upload with user, auth_keys, content and pins
   *
   * @param {string} cid
   * @param {number} userId
   * @returns
   */
  async getUpload(cid, userId) {
    /** @type {PostgrestQueryBuilder<import('./db-client-types').UploadOutput>} */
    const query = this.client.from('upload')
    const {
      data: upload,
      error,
      status,
    } = await query
      .select(this.uploadQuery)
      .eq('content_cid', cid)
      .eq('account_id', userId)
      // @ts-ignore
      .filter('content.pin.service', 'eq', 'IpfsCluster')
      .single()

    if (status === 406 || !upload) {
      return
    }
    if (error) {
      throw new Error(JSON.stringify(error))
    }

    return { ...upload, deals: await this.getDeals(cid) }
  }

  /**
   * List uploads
   *
   * @param {number} userId
   * @param {import('./db-client-types').ListUploadsOptions} opts
   */
  async listUploads(userId, opts) {
    /** @type {PostgrestQueryBuilder<import('./db-client-types').UploadOutput>} */
    const from = this.client.from('upload')
    const match = opts.match || 'exact'
    let query = from
      .select(this.uploadQuery)
      .eq('account_id', userId)
      // @ts-ignore
      .filter('content.pin.service', 'eq', 'IpfsCluster')
      .limit(opts.limit || 10)
      .order('inserted_at', { ascending: false })

    if (opts.status) {
      // @ts-ignore
      query = query.in('content.pin.status', opts.status)
    }

    if (opts.cid) {
      query = query.in('content_cid', opts.cid)
    }

    if (opts.name && match === 'exact') {
      query = query.like('name', `${opts.name}`)
    }

    if (opts.name && match === 'iexact') {
      query = query.ilike('name', `${opts.name}`)
    }

    if (opts.name && match === 'partial') {
      query = query.like('name', `%${opts.name}%`)
    }

    if (opts.name && match === 'ipartial') {
      query = query.ilike('name', `%${opts.name}%`)
    }

    if (opts.before) {
      query = query.lte('inserted_at', opts.before)
    }

    if (opts.after) {
      query = query.gte('inserted_at', opts.after)
    }

    const { data: uploads, error } = await query
    if (error) {
      throw new Error(JSON.stringify(error))
    }

    const cids = uploads?.map((u) => u.content_cid)

    const deals = await this.getDealsForCids(cids)

    return uploads?.map((u) => {
      return {
        ...u,
        deals: deals[u.content_cid] || [],
      }
    })
  }

  /**
   * Delete upload
   *
   * @param {string} cid
   * @param {number} userId
   */
  async deleteUpload(cid, userId) {
    /** @type {PostgrestQueryBuilder<import('./db-client-types').UploadOutput>} */
    const query = this.client.from('upload')

    const { data, error } = await query
      .delete()
      .match({ content_cid: cid, account_id: userId })

    if (error) {
      throw new Error(JSON.stringify(error))
    }

    return data
  }

  /**
   * Get content with pins
   *
   * @param {string} cid
   */
  async getContent(cid) {
    /** @type {PostgrestQueryBuilder<import('./db-client-types').ContentOutput>} */
    const query = this.client.from('content')
    const {
      data: content,
      error,
      status,
    } = await query
      .select(
        `
        cid,
        dag_size,
        inserted_at,
        updated_at,
        pins:pin(status, service)`
      )
      // @ts-ignore
      .filter('pins.service', 'eq', 'IpfsCluster')
      .eq('cid', cid)
      .single()

    if (status === 406 || !content) {
      return
    }
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    return { ...content, deals: await this.getDeals(cid) }
  }

  /**
   * Get deals for a cid
   *
   * @param {string} cid
   * @returns {Promise<import('./../bindings').Deal[]>}
   */
  async getDeals(cid) {
    const deals = await this.getDealsForCids([cid])

    return deals[cid] ? deals[cid] : []
  }

  /**
   * Get deals for multiple cids
   *
   * @param {string[]} cids
   */
  async getDealsForCids(cids = []) {
    const rsp = await this.client.rpc('deals_fn', {
      cids,
    })
    if (rsp.error) {
      throw new Error(JSON.stringify(rsp.error))
    }

    /** @type {Record<string, import('./../bindings').Deal[]>} */
    const result = {}
    for (const d of rsp.data) {
      const { contentCid: cid, ...rest } = d
      if (!Array.isArray(result[cid])) {
        result[cid] = [rest]
      } else {
        result[cid].push(rest)
      }
    }

    return result
  }

  /**
   * Create a new auth key
   *
   * @param {Object} key
   * @param {string} key.name
   * @param {string} key.secret
   * @param {number} key.userId
   */
  async createKey(key) {
    /** @type {PostgrestQueryBuilder<definitions['auth_key']>} */
    const query = this.client.from('auth_key')

    const { data, error } = await query.insert({
      name: key.name,
      secret: key.secret,
      account_id: key.userId,
    })

    if (error) {
      throw new Error(JSON.stringify(error))
    }

    return data
  }

  /**
   * List auth keys
   *
   * @param {number} userId
   */
  async listKeys(userId) {
    /** @type {PostgrestQueryBuilder<definitions['auth_key']>} */
    const query = this.client.from('auth_key')

    const { data, error } = await query
      .select(
        `
      id,
      name,
      secret
      `
      )
      .match({ account_id: userId })

    if (error) {
      throw new Error(JSON.stringify(error))
    }

    return data
  }

  /**
   * Delete auth key
   *
   * @param {number} id
   */
  async deleteKey(id) {
    /** @type {PostgrestQueryBuilder<definitions['auth_key']>} */
    const query = this.client.from('auth_key')

    const { data, error } = await query.delete().match({ id })

    if (error) {
      throw new Error(JSON.stringify(error))
    }
  }
}
