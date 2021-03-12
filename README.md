# nft.storage <!-- omit in toc -->

Unlimited storage of NFT data on IPFS, backed by Filecoin and provided free to [NFTHack](https://nfthack.ethglobal.co/) participants during the hackathon.

# Table of Contents <!-- omit in toc -->
- [`site` Setup](#site-setup)
  - [Cloudflare Workers CLI](#cloudflare-workers-cli)
  - [Auth0 account](#auth0-account)
  - [Cloudflare Workers initial setup:](#cloudflare-workers-initial-setup)
    - [Development Setup](#development-setup)
    - [Production Setup `[env.production]`](#production-setup-envproduction)
- [`site` Usage](#site-usage)
  - [Local development](#local-development)
  - [Deploy](#deploy)
   


## `site` Setup 
### Cloudflare Workers CLI
```bash
yarn global add @cloudflare/wrangler
wrangler login
# when using personal accounts you may need to manually change the `account_id` inside `wrangler.toml` 
```

### Auth0 account
Go to [auth0.com](https://auth0.com) and create an account. Create two "REGULAR WEB APPLICATION" applications one for dev and another for production. In the "settings" of each application you will find the secrets needed to complete the initial setup.

Go to "settings" for your dev application and add the following URLs:

* "Allowed Callback URLs": `http://127.0.0.1:8787/auth`
* "Allowed Web Origins": `http://127.0.0.1:8787`

Do the same for your production application, with the appropriate URLs.

### Cloudflare Workers initial setup:
> This only needs to be run once when setting up from scratch.

#### Development Setup   

Open `wrangler.toml` and add an env for yourself (replacing "USER" with your name and "CF_ACCOUNT" with your Cloudflare account):

```toml
[env.USER]
type = "webpack"
name = "nft-storage-USER"
account_id = "CF_ACCOUNT"
workers_dev = true
route = ""
zone_id = ""
vars = { AUTH0_CALLBACK_URL = "http://127.0.0.1:8787/auth", DEBUG = true }
kv_namespaces = []
```

```bash
cd site
yarn install
# dev and preview KVs
wrangler kv:namespace create USERS --preview --env USER
# cli output something like: `{ binding = "USERS", preview_id = "7e441603d1bc4d5a87f6cecb959018e4" }`
# but you need to put `{ binding = "USERS", preview_id = "7e441603d1bc4d5a87f6cecb959018e4", id = "7e441603d1bc4d5a87f6cecb959018e4" }` inside the `kv_namespaces`.
wrangler kv:namespace create SESSION --preview --env USER
# same as above
wrangler kv:namespace create CSRF --preview --env USER
# same as above
wrangler kv:namespace create NFTS --preview --env USER
# same as above
```
Go to `/site/src/constants.js` *uncomment* the first line and run `wrangler publish --env USER`.

```bash
# dev and preview secrets
wrangler secret put AUTH0_DOMAIN --env USER # Get from auth0 account
wrangler secret put AUTH0_CLIENT_ID --env USER # Get from auth0 account
wrangler secret put AUTH0_CLIENT_SECRET --env USER # Get from auth0 account
wrangler secret put SALT --env USER # open `https://csprng.xyz/v1/api` in the browser and use the value of `Data`
wrangler secret put PINATA_JWT --env USER # Get from Pinata
```
Go to `/site/src/constants.js` *comment* the first line and run `wrangler publish --env USER`.

#### Production Setup `[env.production]`
```bash
# production KVs
wrangler kv:namespace create USERS --env production
# Follow the instructions from the cli output
wrangler kv:namespace create SESSION --env production
# Follow the instructions from the cli output
wrangler kv:namespace create CSRF --env production
# Follow the instructions from the cli output
wrangler kv:namespace create NFTS --env production
# Follow the instructions from the cli output
wrangler secret put AUTH0_DOMAIN --env production # Get from auth0 account
wrangler secret put AUTH0_CLIENT_ID --env production # Get from auth0 account
wrangler secret put AUTH0_CLIENT_SECRET --env production # Get from auth0 account
wrangler secret put SALT --env production # open `https://csprng.xyz/v1/api` in the browser and use the value of `Data`
wrangler secret put PINATA_JWT --env production # Get from Pinata
wrangler publish --env production
```

## `site` Usage

### Local development
```bash
cd site
yarn install
yarn start
```

### Deploy
```bash
yarn deploy
```
