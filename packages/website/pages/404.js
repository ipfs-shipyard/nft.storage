import { useEffect } from 'react'

import countly from '../lib/countly'

export default function Custom404() {
  useEffect(() => {
    countly.trackEvent(countly.events.NOT_FOUND, {
      path: location.pathname,
    })
  }, [])

  return (
    <main className="flex items-center justify-between my-4 lg:my-32 layout-margins min-vh-100 ph3 ph5-ns">
      <h1 className="">404 - Page Not Found</h1>
    </main>
  )
}
