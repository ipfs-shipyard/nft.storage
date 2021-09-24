export {}

import Toucan from 'toucan-js'

declare global {
  const SALT: string
  const DEBUG: string
  const DEALS: KVNamespace
  const USERS: KVNamespace
  const NFTS: KVNamespace
  const NFTS_IDX: KVNamespace
  const METRICS: KVNamespace
  const PINS: KVNamespace
  const FOLLOWUPS: KVNamespace
  const PINATA_QUEUE: KVNamespace
  const PINATA_API_URL: string
  const PINATA_PSA_API_URL: string
  const PINATA_JWT: string
  const CLUSTER_API_URL: string
  const CLUSTER_BASIC_AUTH_TOKEN: string
  const CLUSTER_IPFS_PROXY_API_URL: string
  const CLUSTER_IPFS_PROXY_BASIC_AUTH_TOKEN: string
  const CLUSTER_ADDRS: string
  const MAGIC_SECRET_KEY: string
  const DATABASE_URL: string
  const DATABASE_TOKEN: string
  const ENV: 'dev' | 'staging' | 'production'
  const SENTRY_DSN: string
  const BRANCH: string
  const VERSION: string
  const COMMITHASH: string
  const MAINTENANCE_MODE: 'rw' | 'r-' | '--'
}

export interface RouteContext {
  sentry: Toucan
  params: Record<string, string>
}

export interface Pin {
  /**
   * Content Identifier for the NFT data.
   */
  cid: string
  name?: string
  meta?: Record<string, string>
  status: PinStatus
  created: string
  size?: number
}

export type PinStatus = 'queued' | 'pinning' | 'pinned' | 'failed'

export type NFT = {
  /**
   * Content Identifier for the NFT data.
   */
  cid: string
  /**
   * Type of the data: "directory" or Blob.type.
   */
  type: string
  /**
   * Files in the directory (only if this NFT is a directory).
   */
  files: Array<{ name?: string; type?: string } | undefined>
  /**
   * Pinata pin name and meta.
   */
  pin?: { name?: string; meta?: Record<string, string> }
  /**
   * Name of the JWT token used to create this NFT.
   */
  scope: string
  /**
   * Date this NFT was created in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: YYYY-MM-DDTHH:MM:SSZ.
   */
  created: string
}

export type NFTResponse = NFT & {
  size: number
  pin: Pin
  deals: Deal[]
}

export type CheckNFTResponse = {
  cid: string
  pin: Pin
  deals: Deal[]
}

export type DealStatus = 'queued' | 'active' | 'published' | 'terminated'
export interface Deal {
  status: DealStatus
  lastChanged?: Date
  chainDealID?: number
  datamodelSelector: string
  statusText?: string
  dealActivation?: Date
  dealExpiration?: Date
  miner?: string
  pieceCid: CIDString
  batchRootCid: CIDString
}

export interface User {
  sub: string
  nickname: string
  name: string
  email: string
  picture: string
  issuer: string
  publicAddress: string
  tokens: Record<string, string>
  /**
   * This will actually be json object
   */
  github?: string
}

export type UserSafe = Omit<User, 'tokens' | 'github'>

/**
 * Pins add endpoint body interface
 */
export interface PinsAddInput {
  cid: string
  name: string
  origins: string[]
  meta: Record<string, string>
}

/**
 * Pins endpoints response
 */
export interface PinsResponse {
  requestid: string
  status: PinStatus
  created: string
  pin: {
    cid: string
    meta: Record<string, string>
    name?: string
    origins: string[]
  }
  delegates: string[]
}
