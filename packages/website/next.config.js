const { withSentryConfig } = require('@sentry/nextjs')
const git = require('git-rev-sync')
const fs = require('fs')
const path = require('path')

const shortHash =
  process.env.CF_PAGES === '1'
    ? process.env.CF_PAGES_COMMIT_SHA.substr(0, 7)
    : git.short(__dirname)
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
)
const env = process.env.NEXT_PUBLIC_ENV
const release = `${pkg.name}@${pkg.version}-${env}+${shortHash}`
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  exportPathMap: async function() {
    return {
      '/ipfs-404.html': { page: '/404' },
    }
  },
}

module.exports = withSentryConfig(nextConfig, {
  debug: false,
  silent: true,
  setCommits: { auto: true, ignoreEmpty: true, ignoreMissing: true },
  release,
  dist: shortHash,
  deploy: { env },
})
