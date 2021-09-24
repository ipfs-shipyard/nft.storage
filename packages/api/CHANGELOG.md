# Changelog

## [2.5.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.4.0...api-v2.5.0) (2021-09-24)


### Features

* migrate database to postgres  ([#263](https://www.github.com/ipfs-shipyard/nft.storage/issues/263)) ([ff0c919](https://www.github.com/ipfs-shipyard/nft.storage/commit/ff0c919ad63f8452357ff5f23b3f1ecd24880c86))


### Bug Fixes

* remove nft index cron job ([#453](https://www.github.com/ipfs-shipyard/nft.storage/issues/453)) ([a93433c](https://www.github.com/ipfs-shipyard/nft.storage/commit/a93433c56ba303e10b7c594d83b02c7c6af1a1ec))
* remove usage_model from top level ([#463](https://www.github.com/ipfs-shipyard/nft.storage/issues/463)) ([9d9391d](https://www.github.com/ipfs-shipyard/nft.storage/commit/9d9391d1a9d9eded82bdd834e70bcfcce0024770))

## [2.4.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.3.1...api-v2.4.0) (2021-08-27)


### Features

* remove custom multipart parser ([#336](https://www.github.com/ipfs-shipyard/nft.storage/issues/336)) ([029e71a](https://www.github.com/ipfs-shipyard/nft.storage/commit/029e71aefc1b152a080ffb5739e4f7c2565a1e57))


### Bug Fixes

* **api:** validate CID input for pins add and replace ([#314](https://www.github.com/ipfs-shipyard/nft.storage/issues/314)) ([dd5baca](https://www.github.com/ipfs-shipyard/nft.storage/commit/dd5bacac8207c715b097e7b1bc0555742c6b8488))
* bad dag creation by store api ([#343](https://www.github.com/ipfs-shipyard/nft.storage/issues/343)) ([307e6cd](https://www.github.com/ipfs-shipyard/nft.storage/commit/307e6cd07e4b3587a404ea8fa367721f574d4e32))
* temporarily set local=true for all uploads ([f637c86](https://www.github.com/ipfs-shipyard/nft.storage/commit/f637c86a569d1fc81a481574550e71bc02fae9ac))

### [2.3.2](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.3.1...api-v2.3.2) (2021-08-15)


### Bug Fixes

* temporarily set local=true for all uploads ([f637c86](https://www.github.com/ipfs-shipyard/nft.storage/commit/f637c86a569d1fc81a481574550e71bc02fae9ac))

### [2.3.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.3.0...api-v2.3.1) (2021-08-11)


### Bug Fixes

* only local add files smaller then 2.5MiB ([#287](https://www.github.com/ipfs-shipyard/nft.storage/issues/287)) ([a225fa8](https://www.github.com/ipfs-shipyard/nft.storage/commit/a225fa8d1580bb7db79531bfd25c1e836103f60e))
* set stream-channels=false for cluster add ([#304](https://www.github.com/ipfs-shipyard/nft.storage/issues/304)) ([f1121d0](https://www.github.com/ipfs-shipyard/nft.storage/commit/f1121d0e75b1750e6d1a5a851d5eeed8f04cb64b))

## [2.3.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.2.2...api-v2.3.0) (2021-08-06)


### Features

* esbuild to build api and new tests ([#252](https://www.github.com/ipfs-shipyard/nft.storage/issues/252)) ([3cafc29](https://www.github.com/ipfs-shipyard/nft.storage/commit/3cafc29c0932b36421424827eca04323c26b22f9))
* improvements to the setup ([#246](https://www.github.com/ipfs-shipyard/nft.storage/issues/246)) ([6a2501f](https://www.github.com/ipfs-shipyard/nft.storage/commit/6a2501f5c340af87c1571886961920280afec249))
* update pw-test so its easier to run sw tests ([#240](https://www.github.com/ipfs-shipyard/nft.storage/issues/240)) ([5737ffc](https://www.github.com/ipfs-shipyard/nft.storage/commit/5737ffcb0323e20b31fdabdd305da075b92a9047))


### Bug Fixes

* niftysave pin job failures by adopting request timeouts ([#267](https://www.github.com/ipfs-shipyard/nft.storage/issues/267)) ([0bac638](https://www.github.com/ipfs-shipyard/nft.storage/commit/0bac6385ef0417a7a3453172bf3a3ed9e664f9e6))
* temporarily locally add all uploads ([#286](https://www.github.com/ipfs-shipyard/nft.storage/issues/286)) ([f0443a5](https://www.github.com/ipfs-shipyard/nft.storage/commit/f0443a5b9baa0d6921be7ad8544ec4fd2c1e5218))

### [2.2.2](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.2.1...api-v2.2.2) (2021-07-06)


### Bug Fixes

* null deals ([#235](https://www.github.com/ipfs-shipyard/nft.storage/issues/235)) ([aad1259](https://www.github.com/ipfs-shipyard/nft.storage/commit/aad125902fe4f8e6b5144ed52e60be3988f24e1a))

### [2.2.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.2.0...api-v2.2.1) (2021-06-22)


### Bug Fixes

* chunking issues ([#203](https://www.github.com/ipfs-shipyard/nft.storage/issues/203)) ([d990a20](https://www.github.com/ipfs-shipyard/nft.storage/commit/d990a207fd99aa74bde56a5d6b79e5027cf42287))
* cluster status text for queued pin ([f0f9553](https://www.github.com/ipfs-shipyard/nft.storage/commit/f0f955305e9d65b6993f04a18b30673e5f8bc5e6))
* initial pin status ([1a4d292](https://www.github.com/ipfs-shipyard/nft.storage/commit/1a4d29236bb4f76ec7689e4b9b6ba7f02072d8cd))
* test expectations for new initial pin status ([ddaf11f](https://www.github.com/ipfs-shipyard/nft.storage/commit/ddaf11fd440324a0da8cc0eca80203e10cd233ed))

## [2.2.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.1.0...api-v2.2.0) (2021-06-17)


### Features

* support CAR file uploads ([#178](https://www.github.com/ipfs-shipyard/nft.storage/issues/178)) ([c7e5130](https://www.github.com/ipfs-shipyard/nft.storage/commit/c7e5130022ac1d0db13269582bdfa5e60d41bdea))

## [2.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v2.0.0...api-v2.1.0) (2021-05-26)


### Features

* cron job to ensure our pins are sent to Pinata ([#145](https://www.github.com/ipfs-shipyard/nft.storage/issues/145)) ([d071ca4](https://www.github.com/ipfs-shipyard/nft.storage/commit/d071ca4bb0921f9a663f8024a0e0e8a0fc7de0dd))

## [2.0.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v1.1.0...api-v2.0.0) (2021-05-18)


### ⚠ BREAKING CHANGES

* update cluster client for consistent hashes with IPFS

### Bug Fixes

* update cluster client for consistent hashes with IPFS ([5bc3c67](https://www.github.com/ipfs-shipyard/nft.storage/commit/5bc3c67b5310b54fd4fbc81bd313cccf21a68166))


### Reverts

* collection of followup metrics ([#133](https://www.github.com/ipfs-shipyard/nft.storage/issues/133)) ([b144224](https://www.github.com/ipfs-shipyard/nft.storage/commit/b144224ace1e67ba415206a6a3d9fcb071fbf878))

## [1.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/api-v1.0.0...api-v1.1.0) (2021-05-17)


### Features

* **metrics:** collect and report total followups ([8d43e0f](https://www.github.com/ipfs-shipyard/nft.storage/commit/8d43e0fb6f4b6185df805330a4bd71d947e00586))
* move metrics cron jobs to github actions ([#131](https://www.github.com/ipfs-shipyard/nft.storage/issues/131)) ([4ab3013](https://www.github.com/ipfs-shipyard/nft.storage/commit/4ab30134173764b82d1fb1887dafcb6e8f98ef9d))


### Bug Fixes

* **metrics:** count followups not pins ([5e538d4](https://www.github.com/ipfs-shipyard/nft.storage/commit/5e538d4eb77d5a3c6793ce446ae311b737d7ab47))

## 1.0.0 (2021-05-14)


### Bug Fixes

* **api:** re-enable pinata in pin add ([ada4054](https://www.github.com/ipfs-shipyard/nft.storage/commit/ada405442be2e964f6149899869e266c2db41d60))
