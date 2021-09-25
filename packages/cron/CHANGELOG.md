# Changelog

### [2.1.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/cron-v2.1.0...cron-v2.1.1) (2021-08-11)


### Bug Fixes

* niftysave pin job failures by adopting request timeouts ([#267](https://www.github.com/ipfs-shipyard/nft.storage/issues/267)) ([0bac638](https://www.github.com/ipfs-shipyard/nft.storage/commit/0bac6385ef0417a7a3453172bf3a3ed9e664f9e6))
* set stream-channels=false for cluster add ([#304](https://www.github.com/ipfs-shipyard/nft.storage/issues/304)) ([f1121d0](https://www.github.com/ipfs-shipyard/nft.storage/commit/f1121d0e75b1750e6d1a5a851d5eeed8f04cb64b))

## [2.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/cron-v2.0.0...cron-v2.1.0) (2021-07-13)


### Features

* improvements to the setup ([#246](https://www.github.com/ipfs-shipyard/nft.storage/issues/246)) ([6a2501f](https://www.github.com/ipfs-shipyard/nft.storage/commit/6a2501f5c340af87c1571886961920280afec249))

## [2.0.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/cron-v1.1.0...cron-v2.0.0) (2021-07-06)


### ⚠ BREAKING CHANGES

* add ipfs URL to gateway URL converter (#161)

### Features

* add ipfs URL to gateway URL converter ([#161](https://www.github.com/ipfs-shipyard/nft.storage/issues/161)) ([f115cd8](https://www.github.com/ipfs-shipyard/nft.storage/commit/f115cd8964bc565fc1a3313fc8d2fb3a392dd0ac))


### Bug Fixes

* chunking issues ([#203](https://www.github.com/ipfs-shipyard/nft.storage/issues/203)) ([d990a20](https://www.github.com/ipfs-shipyard/nft.storage/commit/d990a207fd99aa74bde56a5d6b79e5027cf42287))
* cluster status text for queued pin ([f0f9553](https://www.github.com/ipfs-shipyard/nft.storage/commit/f0f955305e9d65b6993f04a18b30673e5f8bc5e6))
* increase DAG size request timeout ([d833ab6](https://www.github.com/ipfs-shipyard/nft.storage/commit/d833ab631b865e9406b6434769d934f8c1bde946))

## [1.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/cron-v1.0.1...cron-v1.1.0) (2021-05-26)


### Features

* add find-user tool ([45dcdc5](https://www.github.com/ipfs-shipyard/nft.storage/commit/45dcdc55b552d1b6ba8f3ba1db9f6a263fcf7e2f))
* cron job to ensure our pins are sent to Pinata ([#145](https://www.github.com/ipfs-shipyard/nft.storage/issues/145)) ([d071ca4](https://www.github.com/ipfs-shipyard/nft.storage/commit/d071ca4bb0921f9a663f8024a0e0e8a0fc7de0dd))


### Bug Fixes

* guard against null size ([52a97af](https://www.github.com/ipfs-shipyard/nft.storage/commit/52a97af6a2cf2be4b8dee1de946f05179b361358))
* increase retry timeout ([7ca6582](https://www.github.com/ipfs-shipyard/nft.storage/commit/7ca6582f0fd9ce07a59c7766fc3c907fe3d1fbf0))
* log line labels ([f4a1f89](https://www.github.com/ipfs-shipyard/nft.storage/commit/f4a1f890f4820aae92d2fcecd630ad972658e4c9))
* pin limiter to v2.0.1 ([107c946](https://www.github.com/ipfs-shipyard/nft.storage/commit/107c9462fc6f9118e8b390c6cbc18ef0bc55f18c))

### [1.0.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/cron-v1.0.0...cron-v1.0.1) (2021-05-18)


### Reverts

* collection of followup metrics ([#133](https://www.github.com/ipfs-shipyard/nft.storage/issues/133)) ([b144224](https://www.github.com/ipfs-shipyard/nft.storage/commit/b144224ace1e67ba415206a6a3d9fcb071fbf878))

## 1.0.0 (2021-05-17)


### Features

* move metrics cron jobs to github actions ([#131](https://www.github.com/ipfs-shipyard/nft.storage/issues/131)) ([4ab3013](https://www.github.com/ipfs-shipyard/nft.storage/commit/4ab30134173764b82d1fb1887dafcb6e8f98ef9d))
