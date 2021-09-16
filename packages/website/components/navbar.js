import { useCallback } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import { useQueryClient } from 'react-query'
import Button from './button.js'
import countly from '../lib/countly'

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 * @param {any} [props.user]
 */
export default function Navbar({ bgColor = 'nsorange', user }) {
  const queryClient = useQueryClient()
  const onLinkClick = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.LINK_CLICK_NAVBAR,
      event.currentTarget
    )
  }, [])

  async function logout() {
    await getMagic().user.logout()
    await queryClient.invalidateQueries('magic-user')
    Router.push('/')
  }

  return (
    <nav className={`bg-${bgColor}`}>
      <div className="flex items-center justify-between ph3 ph5-ns pv3 center mw9">
        <Link href="/">
          <a className="no-underline v-mid" onClick={onLinkClick}>
            <img
              src="/images/logo-nft.storage-sm.png"
              width="160"
              height="79"
              className="mr4 v-mid"
              style={{ maxWidth: '80px', height: 'auto' }}
              alt="NFT Storage Logo"
            />
          </a>
        </Link>
        <div>
          {user ? (
            <>
              <Link href="/files">
                <a
                  className="f4 black no-underline underline-hover v-mid"
                  onClick={onLinkClick}
                >
                  Files
                </a>
              </Link>
              <span className="mh2 v-mid b black">•</span>
              <Link href="/manage">
                <a
                  className="f4 black no-underline underline-hover v-mid"
                  onClick={onLinkClick}
                >
                  API Keys
                </a>
              </Link>
              <span className="mh2 v-mid b black">•</span>
            </>
          ) : null}
          <Link href="/#docs">
            <a
              className="f4 black no-underline underline-hover v-mid mr3"
              onClick={onLinkClick}
            >
              Docs
            </a>
          </Link>
          {user ? (
            <Button
              onClick={logout}
              id="logout"
              tracking={{
                event: countly.events.LOGOUT_CLICK,
                ui: countly.ui.NAVBAR,
                action: 'Logout',
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              href="/login"
              id="login"
              tracking={{
                ui: countly.ui.NAVBAR,
                action: 'Login',
              }}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
