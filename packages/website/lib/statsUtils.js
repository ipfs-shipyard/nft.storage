/**
 * Calculate Growth Rate
 * @param {any} total
 * @param {any} previousTotal
 * @returns {string}
 */
export function calcuateGrowthRate(total, previousTotal) {
  try {
    return (((total - previousTotal) / previousTotal) * 100).toFixed(2)
  } catch (e) {
    throw new Error(`Could not calculate growth rate: ${e}`)
  }
}

/** @type {string[]} */
const uploadKeysToSum = [
  'uploads_blob_total',
  'uploads_car_total',
  'uploads_nft_total',
  'uploads_remote_total',
  'uploads_multipart_total',
]

/**
 * Get Total Uploads
 * @param {any} stats
 * @param {any} keys
 * @returns {any}
 */
const getTotalUploads = (stats, keys) => {
  const keysToNumber = (/** @type {any} */ acc, /** @type {string} */ key) =>
    keys.includes(key) ? acc + stats[key] : acc
  return Object.keys(stats).reduce(keysToNumber, 0)
}

/**
 * Get Previous Total
 * @param {any} stats
 * @param {any} totalUploads
 * @returns {number}
 */
const getPreviousTotal = (stats, totalUploads) =>
  totalUploads - stats.uploads_past_7_total

const getRateFromEthTo = async (to = 'USD') => {
  const ethRateAPI = `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=${to}`
  return await (await fetch(ethRateAPI, { method: 'GET' })).json().catch(() => {
    return null
  })
}

/**
 * Format Bytes
 * @param {any} stats
 * @returns {any}
 */
export function calculateStats(stats) {
  let growthRate = '0'
  const totalUploads = getTotalUploads(stats, uploadKeysToSum)
  const previousTotal = getPreviousTotal(stats, totalUploads)

  if (previousTotal > 0) {
    growthRate = calcuateGrowthRate(totalUploads, previousTotal)
  }

  const dealsSizeGrowthRate = calcuateGrowthRate(
    stats.deals_size_total,
    stats.deals_size_total_prev
  )

  return { ...stats, totalUploads, growthRate, dealsSizeGrowthRate }
}

/**
 * Aggregate stats from NFTPort
 * @param {any} stats
 * @returns {Promise<any>}
 */
export async function calculateMarketStats(stats) {
  const { USD: ethConversion } = await getRateFromEthTo('USD')
  const statsToCalculate = ['image_uri_stats']
  const calculated = Object.keys(stats)
    .filter((stat) => statsToCalculate.includes(stat))
    .reduce(
      (a, c) => {
        for (const prop in stats[c]) {
          a.totalNfts += stats[c][prop].count_successful
          a.totalNfts += stats[c][prop].count_failed
          a.totalMissing += stats[c][prop].count_failed
          a.missingMarketValue += stats[c][prop].estimated_price_failed
          a.totalMarketValue += stats[c][prop].estimated_price_successful
          a.totalMarketValue += stats[c][prop].estimated_price_failed
        }

        return a
      },
      {
        totalNfts: 0,
        totalMarketValue: 0.0,
        totalMissing: 0,
        missingMarketValue: 0.0,
        missingPercentage: 0.0,
        totalMarketValueUSD: 0,
        missingMarketValueUSD: 0,
      }
    )
  calculated.totalNfts = parseFloat(calculated.totalNfts.toFixed(0))
  calculated.totalMarketValue = parseFloat(
    calculated.totalMarketValue.toFixed(2)
  )
  calculated.missingMarketValue = parseFloat(
    calculated.missingMarketValue.toFixed(2)
  )
  if (ethConversion) {
    calculated.totalMarketValueUSD =
      parseFloat(calculated.totalMarketValue.toFixed(2)) *
      parseFloat(ethConversion.toFixed(2))
    calculated.missingMarketValueUSD =
      parseFloat(calculated.missingMarketValue.toFixed(2)) *
      parseFloat(ethConversion.toFixed(2))
  }
  calculated.missingPercentage = (() => {
    return parseFloat(
      ((calculated.totalMissing / calculated.totalNfts) * 100).toFixed(1)
    )
  })()

  return calculated
}
