const path = require('path')
const dotenv = require('dotenv')
const execa = require('execa')
const delay = require('delay')
const { once } = require('events')

/** @typedef {{ proc: execa.ExecaChildProcess<string> }} ProcessObject */

dotenv.config({ path: path.join(__dirname, '../../.env') })

const cli = path.join(__dirname, 'scripts/cli.js')

/** @type {import('esbuild').Plugin} */
const nodeBuiltinsPlugin = {
  name: 'node builtins',
  setup(build) {
    build.onResolve({ filter: /^stream$/ }, () => {
      return { path: require.resolve('readable-stream') }
    })

    build.onResolve({ filter: /^cross-fetch$/ }, () => {
      return { path: path.resolve(__dirname, 'scripts/fetch.js') }
    })
  },
}

const config = {
  inject: [
    path.join(__dirname, './scripts/node-globals.js'),
    path.join(__dirname, './test/scripts/globals.js'),
  ],
  define: {
    NFT_STORAGE_VERSION: JSON.stringify('0.1.0'),
    NFT_STORAGE_COMMITHASH: JSON.stringify('322332'),
    NFT_STORAGE_BRANCH: JSON.stringify('main'),
  },
  plugins: [nodeBuiltinsPlugin],
}

/** @type {import('playwright-test').RunnerOptions} */
module.exports = {
  buildConfig: config,
  buildSWConfig: config,
  beforeTests: async () => {
    const mock = await startMockServer('AWS S3', 9095, 'test/mocks/aws-s3')

    await execa(cli, ['db', '--start'], { stdio: 'inherit' })
    console.log('⚡️ Cluster and Postgres started.')

    await execa('yarn', ['run', 'db-migrate'], {
      stdio: 'inherit',
    })
    console.log('⚡️ SQL schema loaded.')

    await delay(2000)
    return { mock }
  },
  afterTests: async (
    ctx,
    /** @type {{  mock: ProcessObject }} */ beforeTests
  ) => {
    console.log('⚡️ Shutting down mock servers.')

    beforeTests.mock.proc.kill()
    await execa(cli, ['db', '--clean'])
  },
}

/**
 * @param {string} name
 * @param {number} port
 * @param {string} handlerPath
 * @returns {Promise<ProcessObject>}
 */
async function startMockServer(name, port, handlerPath) {
  const proc = execa('smoke', ['-p', String(port), handlerPath], {
    preferLocal: true,
  })
  if (!proc.stdout || !proc.stderr) {
    throw new Error('missing process stdio stream(s)')
  }

  const stdout = await Promise.race([
    once(proc.stdout, 'data'),
    // Make sure that we fail if process crashes. However if it exits without
    // producing stdout just resolve to ''.
    proc.then(() => ''),
  ])

  proc.stdout.on('data', (line) => console.log(line.toString()))
  proc.stderr.on('data', (line) => console.error(line.toString()))

  const startMsg = `Server started on: http://localhost:${port}`
  if (!stdout.toString().includes(startMsg)) {
    throw new Error(`Failed to start ${name} mock server`)
  }

  console.log(`⚡️ Mock ${name} started.`)
  return { proc }
}
