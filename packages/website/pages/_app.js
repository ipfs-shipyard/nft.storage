import { useEffect } from 'react'
import Router from 'next/router'
import { ReactQueryDevtools } from 'react-query/devtools'
import 'tachyons/css/tachyons.css'
import '../styles/global.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import Layout from '../components/layout.js'
import countly from '../lib/countly'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
})

/**
 * App Component
 *
 * @param {any} props
 */
export default function App({ Component, pageProps }) {
  useEffect(() => {
    countly.init()
    Router.events.on('routeChangeComplete', (route) => {
      countly.trackPageView(route)
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Layout {...pageProps}>
        {(props) => <Component {...pageProps} {...props} />}
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
