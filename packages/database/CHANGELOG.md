# Changelog

## [1.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/database-v1.0.0...database-v1.1.0) (2021-09-09)


### Features

* enable niftysave ([#256](https://www.github.com/ipfs-shipyard/nft.storage/issues/256)) ([b93614e](https://www.github.com/ipfs-shipyard/nft.storage/commit/b93614ece6806611addea215726ff43f5f7f98bc))
* implement queries to find TokenAssets by a CID and URI ([#272](https://www.github.com/ipfs-shipyard/nft.storage/issues/272)) ([bf85830](https://www.github.com/ipfs-shipyard/nft.storage/commit/bf85830e68880aba7a85e4a2b867883b769a8dd9))
* migrate status index to task queue ([#322](https://www.github.com/ipfs-shipyard/nft.storage/issues/322)) ([9196649](https://www.github.com/ipfs-shipyard/nft.storage/commit/91966499c38b25e2afeebae5686c82d7f7ef2deb))
* remove custom multipart parser ([#336](https://www.github.com/ipfs-shipyard/nft.storage/issues/336)) ([029e71a](https://www.github.com/ipfs-shipyard/nft.storage/commit/029e71aefc1b152a080ffb5739e4f7c2565a1e57))
* turn migration into cron job ([#327](https://www.github.com/ipfs-shipyard/nft.storage/issues/327)) ([00eef65](https://www.github.com/ipfs-shipyard/nft.storage/commit/00eef6552269df2e328b502f4835d98d61f4e3d3))


### Bug Fixes

* analyzer by switching from index to collections ([d581d9e](https://www.github.com/ipfs-shipyard/nft.storage/commit/d581d9e410769342f7cb40808b414888207d07c3))
* bug with findTokenAssetsByCID endpoint ([#273](https://www.github.com/ipfs-shipyard/nft.storage/issues/273)) ([bf8b2ef](https://www.github.com/ipfs-shipyard/nft.storage/commit/bf8b2ef5ff2141e1f454b103d153f7716f5faa72))
* niftysave pin job failures by adopting request timeouts ([#267](https://www.github.com/ipfs-shipyard/nft.storage/issues/267)) ([0bac638](https://www.github.com/ipfs-shipyard/nft.storage/commit/0bac6385ef0417a7a3453172bf3a3ed9e664f9e6))
* switch niftysave analyzer to pull from new queue endpoint ([#369](https://www.github.com/ipfs-shipyard/nft.storage/issues/369)) ([98bf9c7](https://www.github.com/ipfs-shipyard/nft.storage/commit/98bf9c726b90001fe959f141b0f0e66f878b8a31))
* unblock niftysave ([#257](https://www.github.com/ipfs-shipyard/nft.storage/issues/257)) ([7fc56bd](https://www.github.com/ipfs-shipyard/nft.storage/commit/7fc56bdfbbbbe6a59a1ff7df9a42c81aad100635))
* update migration logic to span across sessions ([86caf09](https://www.github.com/ipfs-shipyard/nft.storage/commit/86caf09ff82ffec18412a0b6ff7f473dd337e0e8))

## 1.0.0 (2021-07-12)


### Features

* enable niftysave ([#238](https://www.github.com/ipfs-shipyard/nft.storage/issues/238)) ([61a30ef](https://www.github.com/ipfs-shipyard/nft.storage/commit/61a30efea3879ec38ba97d0e5b4d300182b50908))
* improvements to the setup ([#246](https://www.github.com/ipfs-shipyard/nft.storage/issues/246)) ([6a2501f](https://www.github.com/ipfs-shipyard/nft.storage/commit/6a2501f5c340af87c1571886961920280afec249))
* migrate niftysave database ([#228](https://www.github.com/ipfs-shipyard/nft.storage/issues/228)) ([a0e2a6d](https://www.github.com/ipfs-shipyard/nft.storage/commit/a0e2a6d8f4a3fcc2135cb25d7d19d6dbd86c891b))
* update pw-test so its easier to run sw tests ([#240](https://www.github.com/ipfs-shipyard/nft.storage/issues/240)) ([5737ffc](https://www.github.com/ipfs-shipyard/nft.storage/commit/5737ffcb0323e20b31fdabdd305da075b92a9047))
