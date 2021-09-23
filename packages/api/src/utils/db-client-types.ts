import { definitions } from './db-types'
import type { Deal, PinStatus } from '../bindings'

export type UpsertUserInput = Pick<
  definitions['account'],
  | 'magic_link_id'
  | 'github_id'
  | 'name'
  | 'picture'
  | 'email'
  | 'public_address'
  | 'github'
>

export type UserOutput = definitions['account'] & {
  keys: Array<
    Pick<definitions['auth_key'], 'account_id' | 'id' | 'name' | 'secret'>
  >
}

type PinOutput = definitions['pin_view'] & {
  status: PinStatus
}

export type UploadOutput = definitions['upload'] & {
  files: Array<{ name?: string; type?: string } | undefined>
  meta: Record<string, string>
  origins: string[]
  user: Pick<definitions['account'], 'id' | 'magic_link_id'>
  key: Pick<definitions['auth_key'], 'name'>
  content: Pick<definitions['content'], 'dag_size'> & {
    pin: Pick<PinOutput, 'service' | 'status'>[]
  }
  deals: Deal[]
}

export interface CreateUploadInput {
  account_id: definitions['upload']['account_id']
  content_cid: definitions['upload']['content_cid']
  source_cid: definitions['upload']['source_cid']
  key_id?: definitions['upload']['key_id']
  mime_type?: definitions['upload']['mime_type']
  type: definitions['upload']['type']
  dag_size?: definitions['content']['dag_size']
  // pins: Array<{
  //   status: definitions['pin']['status']
  //   service: definitions['pin']['service']
  // }>
  files?: Array<{ name?: string; type?: string }>
  origins?: string[]
  meta?: Record<string, string>
  name?: string
}

export type ContentOutput = definitions['content'] & {
  pins: Array<PinOutput>
  deals: Deal[]
}

export interface ListUploadsOptions {
  cid?: string[]
  /**
   * Pin objects with specified name (by default a case-sensitive, exact match)
   */
  name?: string
  /**
   * Customize the text matching strategy applied when the name filter is present; exact (the default) is a case-sensitive exact match, partial matches anywhere in the name, iexact and ipartial are case-insensitive versions of the exact and partial strategies
   */
  match?: 'exact' | 'iexact' | 'partial' | 'ipartial'
  status?: Array<definitions['pin']['status']>
  before?: string
  after?: string
  /**
   * Max records (default: 10)
   */
  limit?: number
  meta?: unknown
}
