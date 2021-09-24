# Changelog

## [3.3.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.2.2...nft.storage-v3.3.0) (2021-09-24)


### Features

* migrate database to postgres  ([#263](https://www.github.com/ipfs-shipyard/nft.storage/issues/263)) ([ff0c919](https://www.github.com/ipfs-shipyard/nft.storage/commit/ff0c919ad63f8452357ff5f23b3f1ecd24880c86))

### [3.2.2](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.2.1...nft.storage-v3.2.2) (2021-09-14)


### Bug Fixes

* capitalization ([d62e70b](https://www.github.com/ipfs-shipyard/nft.storage/commit/d62e70bf6bec1c0d6d9f33c74bb8404d8f746b5a))

### [3.2.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.2.0...nft.storage-v3.2.1) (2021-08-30)


### Bug Fixes

* **website:** fix api docs error ([#352](https://www.github.com/ipfs-shipyard/nft.storage/issues/352)) ([073d5aa](https://www.github.com/ipfs-shipyard/nft.storage/commit/073d5aa29b62de9253e1d362eaf1347b69929fa8)), closes [#348](https://www.github.com/ipfs-shipyard/nft.storage/issues/348)

## [3.2.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.1.3...nft.storage-v3.2.0) (2021-08-27)


### Features

* remove custom multipart parser ([#336](https://www.github.com/ipfs-shipyard/nft.storage/issues/336)) ([029e71a](https://www.github.com/ipfs-shipyard/nft.storage/commit/029e71aefc1b152a080ffb5739e4f7c2565a1e57))


### Bug Fixes

* bad dag creation by store api ([#343](https://www.github.com/ipfs-shipyard/nft.storage/issues/343)) ([307e6cd](https://www.github.com/ipfs-shipyard/nft.storage/commit/307e6cd07e4b3587a404ea8fa367721f574d4e32))
* Relaxes image/* requirement ([#334](https://www.github.com/ipfs-shipyard/nft.storage/issues/334)) ([f484297](https://www.github.com/ipfs-shipyard/nft.storage/commit/f484297123de4b5eca900831069dcd3fab2ac3b9))

### [3.1.3](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.1.2...nft.storage-v3.1.3) (2021-08-11)


### Bug Fixes

* **client:** fix back docs output ([628dafd](https://www.github.com/ipfs-shipyard/nft.storage/commit/628dafdb27923a2c794ff611577e5144fd97deaf))

### [3.1.2](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.1.1...nft.storage-v3.1.2) (2021-08-11)


### Bug Fixes

* **client:** bump version for release ([3df7fcf](https://www.github.com/ipfs-shipyard/nft.storage/commit/3df7fcf8ef2949875eabacee21c8d9d60349b6a1))

### [3.1.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.1.0...nft.storage-v3.1.1) (2021-08-11)


### Bug Fixes

* **client:** dont publish everything ([8919819](https://www.github.com/ipfs-shipyard/nft.storage/commit/89198192508ed8cdd2084e312a5488348ea862af))

## [3.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.0.1...nft.storage-v3.1.0) (2021-08-10)


### Features

* esbuild to build api and new tests ([#252](https://www.github.com/ipfs-shipyard/nft.storage/issues/252)) ([3cafc29](https://www.github.com/ipfs-shipyard/nft.storage/commit/3cafc29c0932b36421424827eca04323c26b22f9))
* improvements to the setup ([#246](https://www.github.com/ipfs-shipyard/nft.storage/issues/246)) ([6a2501f](https://www.github.com/ipfs-shipyard/nft.storage/commit/6a2501f5c340af87c1571886961920280afec249))
* update pw-test so its easier to run sw tests ([#240](https://www.github.com/ipfs-shipyard/nft.storage/issues/240)) ([5737ffc](https://www.github.com/ipfs-shipyard/nft.storage/commit/5737ffcb0323e20b31fdabdd305da075b92a9047))


### Bug Fixes

* broken links in client readme ([#294](https://www.github.com/ipfs-shipyard/nft.storage/issues/294)) ([afaa41e](https://www.github.com/ipfs-shipyard/nft.storage/commit/afaa41ef9398a4bf72cf98530b1035f7408577ba))
* **client:** avoid single arg arrow fn ([a425ed2](https://www.github.com/ipfs-shipyard/nft.storage/commit/a425ed25a11b279f141c16d210782b8fbe47c6c4))
* unblock niftysave ([#257](https://www.github.com/ipfs-shipyard/nft.storage/issues/257)) ([7fc56bd](https://www.github.com/ipfs-shipyard/nft.storage/commit/7fc56bdfbbbbe6a59a1ff7df9a42c81aad100635))

### [3.0.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v3.0.0...nft.storage-v3.0.1) (2021-06-24)


### Bug Fixes

* add storeCar to client interface.ts ([#205](https://www.github.com/ipfs-shipyard/nft.storage/issues/205)) ([43c0bd3](https://www.github.com/ipfs-shipyard/nft.storage/commit/43c0bd3b888f28978e5ab3ab147393b2c3d24234))
* the CarReader type is a collection of interfaces ([#214](https://www.github.com/ipfs-shipyard/nft.storage/issues/214)) ([09fd8cb](https://www.github.com/ipfs-shipyard/nft.storage/commit/09fd8cbb49dfb893fd480cc1f94b79afdc2fb769))

## [3.0.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v2.1.1...nft.storage-v3.0.0) (2021-06-22)


### ⚠ BREAKING CHANGES

* car chunking client (#199)

### Features

* car chunking client ([#199](https://www.github.com/ipfs-shipyard/nft.storage/issues/199)) ([fdfa8e9](https://www.github.com/ipfs-shipyard/nft.storage/commit/fdfa8e9cddcf144b5b643f005e28ed652bf44ca9)), closes [#173](https://www.github.com/ipfs-shipyard/nft.storage/issues/173)
* deal data selector ([#198](https://www.github.com/ipfs-shipyard/nft.storage/issues/198)) ([7261c53](https://www.github.com/ipfs-shipyard/nft.storage/commit/7261c5350aff3f1ff991a8ff5c22d67722da6c5f)), closes [#192](https://www.github.com/ipfs-shipyard/nft.storage/issues/192)


### Bug Fixes

* chunking issues ([#203](https://www.github.com/ipfs-shipyard/nft.storage/issues/203)) ([d990a20](https://www.github.com/ipfs-shipyard/nft.storage/commit/d990a207fd99aa74bde56a5d6b79e5027cf42287))

### [2.1.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v2.1.0...nft.storage-v2.1.1) (2021-06-18)


### Bug Fixes

* car upload example ([#197](https://www.github.com/ipfs-shipyard/nft.storage/issues/197)) ([c6b1a68](https://www.github.com/ipfs-shipyard/nft.storage/commit/c6b1a68e643390464b3b46a2707a6430c3ce4f74))
* **client:** npm lifecycle build command ([#194](https://www.github.com/ipfs-shipyard/nft.storage/issues/194)) ([41138df](https://www.github.com/ipfs-shipyard/nft.storage/commit/41138dfe5fe7308eb2b1dd4f9acd82de3a11f63d))
* misc docs issues ([#190](https://www.github.com/ipfs-shipyard/nft.storage/issues/190)) ([04e9840](https://www.github.com/ipfs-shipyard/nft.storage/commit/04e9840e35903a6738b0e947c150047ce521f912))

## [2.1.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v2.0.0...nft.storage-v2.1.0) (2021-06-15)


### Features

* support CAR file uploads ([#178](https://www.github.com/ipfs-shipyard/nft.storage/issues/178)) ([c7e5130](https://www.github.com/ipfs-shipyard/nft.storage/commit/c7e5130022ac1d0db13269582bdfa5e60d41bdea))

## [2.0.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v1.4.0...nft.storage-v2.0.0) (2021-06-01)


### ⚠ BREAKING CHANGES

* add ipfs URL to gateway URL converter (#161)

### Features

* add ipfs URL to gateway URL converter ([#161](https://www.github.com/ipfs-shipyard/nft.storage/issues/161)) ([f115cd8](https://www.github.com/ipfs-shipyard/nft.storage/commit/f115cd8964bc565fc1a3313fc8d2fb3a392dd0ac))

## [1.4.0](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v1.3.1...nft.storage-v1.4.0) (2021-05-26)


### Features

* allow extensions to ERC-1155 metadata ([#146](https://www.github.com/ipfs-shipyard/nft.storage/issues/146)) ([f45cf9f](https://www.github.com/ipfs-shipyard/nft.storage/commit/f45cf9f32a1143853c533a1a016b8f9443c666dd))

### [1.3.1](https://www.github.com/ipfs-shipyard/nft.storage/compare/nft.storage-v1.3.0...nft.storage-v1.3.1) (2021-05-14)


### Bug Fixes

* **client:** fix publish ([052fee0](https://www.github.com/ipfs-shipyard/nft.storage/commit/052fee0661256c05378470a2276bb46e99ccbe2d))

## 1.3.0 (2021-05-14)


### Bug Fixes

* **client:** let try auto publish ([46d0e28](https://www.github.com/ipfs-shipyard/nft.storage/commit/46d0e284abb8ae4da53e87530ac908e6c776d141))


### Miscellaneous Chores

* **client:** release bump ([23c2457](https://www.github.com/ipfs-shipyard/nft.storage/commit/23c2457bee1a8ba967934e95f2cdaa0228c66e6b))
* fix client version ([70ce7e9](https://www.github.com/ipfs-shipyard/nft.storage/commit/70ce7e94b4fe3a2fdba7146a5c1ac7cb241c2694))
