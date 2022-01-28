/**
 * @typedef {Object} SummaryMetrics
 * @property {number} totalWinnerResponseTime total response time of the requests
 * @property {number} totalWinnerSuccessfulRequests total number of successful requests
 * @property {number} totalCachedResponses total number of cached responses
 */

// Key to track total time for winner gateway to respond
const TOTAL_WINNER_RESPONSE_TIME_ID = 'totalWinnerResponseTime'
// Key to track total successful requests
const TOTAL_WINNER_SUCCESSFUL_REQUESTS_ID = 'totalWinnerSuccessfulRequests'
// Key to track total cached requests
const TOTAL_CACHED_RESPONSES_ID = 'totalCachedResponses'

/**
 * Durable Object for keeping generic Metrics of gateway.nft.storage
 */
export class SummaryMetrics0 {
  constructor(state) {
    this.state = state

    // `blockConcurrencyWhile()` ensures no requests are delivered until initialization completes.
    this.state.blockConcurrencyWhile(async () => {
      // Total response time
      this.totalWinnerResponseTime =
        (await this.state.storage.get(TOTAL_WINNER_RESPONSE_TIME_ID)) || 0
      // Total successful requests
      this.totalWinnerSuccessfulRequests =
        (await this.state.storage.get(TOTAL_WINNER_SUCCESSFUL_REQUESTS_ID)) || 0
      // Total cached requests
      this.totalCachedResponses =
        (await this.state.storage.get(TOTAL_CACHED_RESPONSES_ID)) || 0
    })
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    // Apply requested action.
    let url = new URL(request.url)

    // GET
    if (request.method === 'GET') {
      switch (url.pathname) {
        case '/metrics':
          return new Response(
            JSON.stringify({
              totalWinnerResponseTime: this.totalWinnerResponseTime,
              totalWinnerSuccessfulRequests: this.totalWinnerSuccessfulRequests,
              totalCachedResponses: this.totalCachedResponses,
            })
          )
        default:
          return new Response('Not found', { status: 404 })
      }
    }

    // POST
    switch (url.pathname) {
      case '/metrics/winner':
        const data = await request.json()
        // Updated Metrics
        this.totalWinnerResponseTime += data.responseTime
        this.totalWinnerSuccessfulRequests += 1
        // Save updated Metrics
        await Promise.all([
          this.state.storage.put(
            TOTAL_WINNER_RESPONSE_TIME_ID,
            this.totalWinnerResponseTime
          ),
          this.state.storage.put(
            TOTAL_WINNER_SUCCESSFUL_REQUESTS_ID,
            this.totalWinnerSuccessfulRequests
          ),
        ])
        return new Response()
      case '/metrics/cache':
        // Update metrics
        this.totalCachedResponses += 1
        // Sabe updated metrics
        await this.state.storage.put(
          TOTAL_CACHED_RESPONSES_ID,
          this.totalCachedResponses
        )
        return new Response()
      default:
        return new Response('Not found', { status: 404 })
    }
  }
}
