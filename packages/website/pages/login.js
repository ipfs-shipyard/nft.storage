import { useState } from 'react'
import Router from 'next/router'
import { loginEmail, loginSocial } from '../lib/magic.js'
import countly from '../lib/countly'
import Button from '../components/button.js'
import { useQueryClient } from 'react-query'

export function getStaticProps() {
  return {
    props: {
      title: 'Login - NFT Storage',
      redirectTo: '/files',
      redirectIfFound: true,
    },
  }
}

export default function Login() {
  const queryClient = useQueryClient()
  const [errorMsg, setErrorMsg] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function onSubmit(e) {
    e.preventDefault()

    if (errorMsg) setErrorMsg('')
    setDisabled(true)

    try {
      await loginEmail(e.currentTarget.email.value)
      await queryClient.invalidateQueries('magic-user')
      Router.push('/files')
    } catch (error) {
      setDisabled(false)
      console.error('An unexpected error happened occurred:', error)
      setErrorMsg(error.message)
    }
  }
  return (
    <main className="bg-nsorange">
      <div className="mw9 center pv3 ph5 min-vh-100">
        <form onSubmit={onSubmit} className="tc">
          <label className="f5 db mb2">
            <h2>Log in</h2>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="input-reset ba b--black pa2 mb2 w5 center db"
          />

          <Button
            type="submit"
            disabled={disabled}
            wrapperClassName="w5"
            tracking={{
              event: countly.events.LOGIN_CLICK,
              ui: countly.ui.LOGIN,
              action: 'Sign Up / Login',
            }}
          >
            Sign Up / Login
          </Button>

          {errorMsg && <p className="error">{errorMsg}</p>}

          <h4>Or with</h4>

          <Button
            wrapperClassName="w5"
            onClick={() => {
              setIsRedirecting(true)
              loginSocial('github')
            }}
            tracking={{
              event: countly.events.LOGIN_CLICK,
              ui: countly.ui.LOGIN,
              action: 'Github',
            }}
          >
            {isRedirecting ? 'Redirecting...' : 'Github'}
          </Button>
          <br />
          <br />
        </form>
      </div>
    </main>
  )
}
