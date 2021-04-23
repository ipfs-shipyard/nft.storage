import { stores } from '../constants.js'
import * as metrics from '../models/metrics.js'
import * as deals from '../models/deals.js'

/**
 * @typedef {{
 *   queued: number,
 *   proposing: number,
 *   accepted: number,
 *   failed: number,
 *   published: number,
 *   active: number,
 *   terminated: number
 * }} DealsSummary
 */

// TODO: keep running total?
export async function updateUserMetrics() {
  let total = 0
  let done = false
  let cursor
  while (!done) {
    // @ts-ignore
    const users = await stores.users.list({ cursor })
    total += users.keys.length
    cursor = users.cursor
    done = users.list_complete
  }
  await metrics.set('users:total', total)
}

// TODO: keep running totals?
export async function updateNftMetrics() {
  let total = 0
  let totalBytes = 0
  let totalPins = 0
  let done = false
  let cursor
  while (!done) {
    // @ts-ignore
    const nftList = await stores.nfts.list({ cursor, limit: 1000 })
    total += nftList.keys.length
    for (const k of nftList.keys) {
      if (!k.metadata) continue
      totalBytes += k.metadata.size || 0
      if (k.metadata.pinStatus === 'pinned') {
        totalPins++
      }
    }
    cursor = nftList.cursor
    done = nftList.list_complete
  }
  await Promise.all([
    // Total number of NFTs stored on nft.storage
    metrics.set('nfts:total', total),
    // Total bytes of all NFTs
    metrics.set('nfts:totalBytes', totalBytes),
    // Total number of NFTs pinned on IPFS
    metrics.set('nfts:pins:total', totalPins),
  ])
}

// TODO: keep running totals?
export async function updateNftDealMetrics() {
  const totals = {
    queued: 0,
    proposing: 0,
    accepted: 0,
    failed: 0,
    published: 0,
    active: 0,
    terminated: 0,
    unknown: 0,
  }
  let done = false
  let cursor
  while (!done) {
    // @ts-ignore
    const dealList = await stores.deals.list({ cursor, limit: 1000 })
    for (const k of dealList.keys) {
      /** @type {DealsSummary} */
      let summary = k.metadata
      // TODO: remove when ALL deals have summary in metadata
      if (summary == null) {
        const d = await deals.get(k.name)
        if (!d.length) continue
        summary = getDealsSummary(d)
      }
      const status = getEffectiveStatus(summary)
      totals[status]++
    }
    cursor = dealList.cursor
    done = dealList.list_complete
  }
  await Promise.all([
    // Total number of NFTs stored on Filecoin in active deals
    metrics.set('nfts:deals:active:total', totals.active),
    metrics.set('nfts:deals:published:total', totals.published),
    metrics.set('nfts:deals:accepted:total', totals.accepted),
    metrics.set('nfts:deals:proposing:total', totals.proposing),
    // Total number of NFTs queued for the next deal batch
    metrics.set('nfts:deals:queued:total', totals.queued),
    metrics.set('nfts:deals:failed:total', totals.failed),
    metrics.set('nfts:deals:terminated:total', totals.terminated),
  ])
}

/**
 * @param {import('../bindings.js').Deal[]} deals
 * @returns {DealsSummary}
 */
function getDealsSummary(deals) {
  const summary = {
    queued: 0,
    proposing: 0,
    accepted: 0,
    failed: 0,
    published: 0,
    active: 0,
    terminated: 0,
  }
  deals.forEach((d) => {
    summary[d.status]++
  })
  return summary
}

/**
 *
 * @param {DealsSummary} summary
 * @returns {import('../bindings.js').Deal['status'] | 'unknown'}
 */
function getEffectiveStatus(summary) {
  /** @type import('../bindings.js').Deal['status'][] */
  const orderedStatues = [
    'active',
    'published',
    'accepted',
    'proposing',
    'queued',
    'failed',
    'terminated',
  ]
  for (const s of orderedStatues) {
    if (summary[s]) return s
  }
  return 'unknown'
}
