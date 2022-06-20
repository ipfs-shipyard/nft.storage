#!/usr/bin/env sh
# This script force builds docker images, src the env, kills the old containers, and starts the new containers.

# We're moving this script around a lot, and it's pretty cwd-dependent.
ENV_FILE=../../.env
COMPOSE_FILES="--file ./docker/docker-compose.yml --file ./docker/docker-compose.dev.yml"

docker compose \
  --project-name="nft-storage-api" \
  $COMPOSE_FILES --env-file="$ENV_FILE" up \
  --always-recreate-deps \
  --remove-orphans \
  --force-recreate \
  --renew-anon-volumes \
  --build \
;
