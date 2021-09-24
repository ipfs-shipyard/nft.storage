# Generate an API key at https://dashboard.heroku.com/account/applications
# Use your usual email address and API key for password.
heroku login --interactive

# PostgreSQL ###################################################################

# Create empty apps for staging and production
heroku apps:create nft-storage-staging --team=web3-storage
heroku apps:create nft-storage-prod --team=web3-storage

# Add PostgreSQL databases
heroku addons:create heroku-postgresql:premium-4 --app=nft-storage-staging --name=nft-storage-staging-0
heroku addons:create heroku-postgresql:premium-4 --app=nft-storage-prod --name=nft-storage-prod-0

# Add replica
heroku addons:create heroku-postgresql:premium-4 --app=nft-storage-prod --name=nft-storage-replica-0 --follow $(heroku config:get DATABASE_URL --app=nft-storage-prod)

# Add schema
heroku pg:psql nft-storage-staging-0 --app=nft-storage-staging
# ...run schema SQL from /packages/db/tables.sql
# ...run schema SQL from /packages/db/cargo-fdw.sql
heroku pg:psql nft-storage-prod-0 --app=nft-storage-prod
# ...run schema SQL from /packages/db/tables.sql
# ...run schema SQL from /packages/db/cargo-fdw.sql

# PostgREST ####################################################################

# Create PostgREST staging and production apps and connect them to staging/production DBs
# https://elements.heroku.com/buildpacks/postgrest/postgrest-heroku
# (App name has 30 char limit)
heroku apps:create nft-storage-pgrest-staging --buildpack https://github.com/PostgREST/postgrest-heroku --team=web3-storage
heroku apps:create nft-storage-pgrest-prod --buildpack https://github.com/PostgREST/postgrest-heroku --team=web3-storage
# heroku git:remote -a nft-storage-pgrest-staging

# Bump dyno sizes
heroku dyno:resize web=standard-1x --app nft-storage-pgrest-staging
heroku dyno:resize web=standard-1x --app nft-storage-pgrest-prod

# Create the web_anon, authenticator and nft_storage credentials
# (Heroku does not allow this to be done in the DB)
# Note that by default the created credential has NO PRIVILEGES
heroku pg:credentials:create nft-storage-staging-0 --name=web_anon --app=nft-storage-staging
heroku pg:credentials:create nft-storage-staging-0 --name=authenticator --app=nft-storage-staging
heroku pg:credentials:create nft-storage-staging-0 --name=nft_storage --app=nft-storage-staging

heroku pg:credentials:create nft-storage-prod-0 --name=web_anon --app=nft-storage-prod
heroku pg:credentials:create nft-storage-prod-0 --name=authenticator --app=nft-storage-prod
heroku pg:credentials:create nft-storage-prod-0 --name=nft_storage --app=nft-storage-prod

# Grant privileges to PostgREST DB users
# https://postgrest.org/en/stable/tutorials/tut0.html
# https://postgrest.org/en/stable/tutorials/tut1.html
heroku pg:psql nft-storage-staging-0 --app=nft-storage-staging < grant-postgrest.sql
heroku pg:psql nft-storage-prod-0 --app=nft-storage-prod < grant-postgrest.sql

# Configure the DB_URI and JWT_SECRET for PostgREST
heroku config:set DB_URI=$(heroku config:get DATABASE_URL --app=nft-storage-staging) --app=nft-storage-pgrest-staging
heroku config:set DB_URI=$(heroku config:get DATABASE_URL --app=nft-storage-prod) --app=nft-storage-pgrest-prod
# Obtain secret from 1password vault!
heroku config:set JWT_SECRET="supersecret" --app=nft-storage-pgrest-staging
heroku config:set JWT_SECRET="supersecret" --app=nft-storage-pgrest-prod

# Deploy
cd postgrest/
git init
git add -A
git commit -m "chore: configure postgrest"

heroku git:remote --app=nft-storage-pgrest-staging
git push heroku main
heroku git:remote --app=nft-storage-pgrest-prod
git push heroku main

# Custom domains
heroku domains:add db-staging.nft.storage --app=nft-storage-pgrest-staging
heroku domains:add db.nft.storage --app=nft-storage-pgrest-prod

# SSL certs
heroku certs:auto:enable --app=nft-storage-pgrest-staging
heroku certs:auto:enable --app=nft-storage-pgrest-prod

# dagcargo #####################################################################

# Add dagcargo user
heroku pg:credentials:create nft-storage-staging-0 --name=dagcargo --app=nft-storage-staging
heroku pg:credentials:create nft-storage-prod-0 --name=dagcargo --app=nft-storage-prod

# Grant privileges to dagcargo user
heroku pg:psql nft-storage-staging-0 --app=nft-storage-staging < grant-dagcargo.sql
heroku pg:psql nft-storage-prod-0 --app=nft-storage-prod < grant-dagcargo.sql
