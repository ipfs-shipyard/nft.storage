import countly from 'countly-sdk-web'

const config = {
  key: process.env.NEXT_PUBLIC_COUNTLY_KEY,
  url: process.env.NEXT_PUBLIC_COUNTLY_URL,
}

/** @constant */
export const events = {
  LINK_CLICK_NAVBAR: 'linkClickNavbar',
  LINK_CLICK_FOOTER: 'linkClickFooter',
  // Used for CTAs that are only linking to other pages/resources
  CTA_LINK_CLICK: 'ctaLinkClick',
  // Other custom action events
  LOGIN_CLICK: 'loginClick',
  LOGOUT_CLICK: 'logoutClick',
  FILE_UPLOAD_CLICK: 'fileUploadClick',
  FILE_DELETE_CLICK: 'fileDeleteClick',
  FILES_NAVIGATION_CLICK: 'filesNavigationClick',
  TOKEN_CREATE: 'tokenCreate',
  TOKEN_COPY: 'tokenCopy',
  TOKEN_DELETE: 'tokenDelete',
  NOT_FOUND: 'notFound',
}

/** @constant */
export const ui = {
  HOME_HERO: 'home/hero',
  HOME_GET_STARTED: 'home/get-started',
  NAVBAR: 'navbar',
  LOGIN: 'login',
  FILES: 'files',
  NEW_FILE: 'new-file',
  NEW_TOKEN: 'new-token',
  TOKENS: 'tokens',
}

/**
 * Initialize countly analytics object
 */
export function init() {
  if (typeof window === 'undefined') {
    return
  }

  if (ready) {
    return
  }

  if (!config.key || !config.url) {
    console.warn('[lib/countly]', 'Countly config not found.')

    return
  }

  countly.init({ app_key: config.key, url: config.url, debug: false })

  countly.track_sessions()
  countly.track_pageview()
  countly.track_clicks()
  countly.track_links()
  countly.track_scrolls()

  ready = true
}

/**
 * Track an event to countly with custom data
 *
 * @param {string} event Event name to be sent to countly.
 * @param {Object} [segmentation] Custom data object to be used as segmentation data in countly.
 */
export function trackEvent(event, segmentation = {}) {
  if (!ready) {
    init()
  }

  ready &&
    countly.add_event({
      key: event,
      segmentation: {
        path: location.pathname,
        ...segmentation,
      },
    })
}

/**
 * Track page view to countly.
 *
 * @param {string} [path] Page route to track. Defaults to window.location.pathname if not provided.
 */
export function trackPageView(path) {
  if (!ready) {
    init()
  }

  ready && countly.track_pageview(path)
}

/**
 * Track custom link click.
 * @param {string} event Event name to be sent to countly.
 * @param {HTMLLinkElement} target DOM element target of the clicked link.
 * @param {Object} data Extra data to be sent to countly
 */
export function trackCustomLinkClick(event, target, data = {}) {
  if (!ready) {
    init()
  }

  ready &&
    trackEvent(event, {
      link: target.href.includes(location.origin)
        ? new URL(target.href).pathname
        : target.href,
      text: target.innerText,
      ...data,
    })
}

export let ready = false

export default {
  events,
  ui,
  init,
  trackEvent,
  trackPageView,
  trackCustomLinkClick,
  ready,
}
