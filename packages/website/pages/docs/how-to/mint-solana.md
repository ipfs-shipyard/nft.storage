---
title: Mint NFTs on Solana with Metaplex
---

import Callout from 'nextra-theme-docs/callout';

# Store and mint NFTs on Solana with Metaplex

[Solana](https://solana.com) is a high-performance, permissionless blockchain that has rapidly grown and found an enthusiastic community in the NFT space.

With NFT.Storage, you can upload all the off-chain data for your Solana NFTs, including images, videos, animations, and metadata, leveraging the power of [decentralized storage][concepts-decentralized-storage] to preserve your NFT data and make it available on the web.

{ /* TODO: include this once https://github.com/metaplex-foundation/metaplex/pull/1757 is merged:

You can even upload data for Solana NFTs without an NFT.Storage account! By using a signature from your Solana wallet, you (or your users, if you're building a platform) can make free uploads to NFT.Storage without an NFT.Storage API key.
*/ }

At the most fundamental level, an NFT on Solana is defined by the Solana Program Library's [Token program](https://spl.solana.com/token), which enables the creation of both fungible and non-fungible tokens on Solana. While it's possible to [create NFTs through the Token program directly](https://spl.solana.com/token#example-create-a-non-fungible-token), tokens created in this way have no associated metadata or intrinsic "meaning" and are essentially just unique identifiers that can be owned by a Solana account.

To build feature-rich NFTs, the Solana community has developed standards on top of the basic NFT functionality provided by the Token program which allow "decorating" a token with metadata describing the token and its properties.

This guide will focus on [Metaplex](https://metaplex.com), which is currently the most popular and fully featured NFT standard on Solana, enabling thousands of NFT projects. If you're using a different Solana program to mint your NFTs, the principles here will still apply, but you may need to use different tools and metadata conventions.

## Metaplex NFT overview

Metaplex NFTs consist of a few pieces that work together to provide the complete "NFT experience".

First, an SPL token account is created using the SPL Token program with a supply of one (with zero decimals or "fractional tokens"), making the token non-fungible. This new account is referred to as the "token mint" and is controlled by the token creator's Solana account.

<Callout emoji="ℹ️">
As of version 1.1 of the [Metaplex Token Standard][metaplex-token-standard], Metaplex also supports "semi-fungible" tokens that can have a supply greater than one. These are called "Fungible Assets" in the Metaplex docs. We won't be covering them in this guide, but it's good to know they're there!
</Callout>

The newly created token account is then registered with the Metaplex [Token Metadata contract](http://docs.metaplex.com/architecture/deep_dive/overview), which stores some information about the token "on-chain" in a Solana account. The information stored on chain includes the name of the token, a short symbol, some information about the token creators and royalty splits, and a URI that points to a JSON document with more metadata.

The URI for the extended metadata is important, as the extended metadata contains all the information about the images and other media files associated with the NFT, as well as things like a description and whatever custom properties you might need.

There are many ways to create and distribute Metaplex NFTs, some of which are tailored for a particular use case. This guide will focus on "Candy Machines", which are designed to mint NFTs in a random, unpredictable manner upon request, similar to a gumball machine that dispenses a random flavor when given a coin.

Candy Machines are often used for generative art NFTs and profile pic (PFP) collections, where hundreds or thousands of NFTs may comprise a collection. Our example will be smaller in scope, but you can scale up the technique as far as you need.

Later you'll [use a tool called the Candy Machine CLI](#using-candy-machine-cli) to handle the process of uploading NFT data, creating the token, and minting NFTs. First, see the section below to learn how to [prepare your metadata](#preparing-your-metadata) for upload.

## Preparing your metadata

Before you can configure and create a Candy Machine, you'll need to prepare some metadata that describes each NFT in the collection.

The [Metaplex Token Standard][metaplex-token-standard] defines the standard metadata fields for Metaplex NFTs. This includes both the on-chain and off-chain components.

The on-chain metadata contains the public keys of the Solana accounts that are authorized to mint and update the NFT, as well as some infromation about whether the NFT has been sold, what collection it belongs to, and other pieces of "state" relating to the NFT.

The on-chain metadata also includes a `uri` field that links to a JSON document with details about the NFT, along with a few fields from the JSON metadata that are preserved on-chain, such as the `name` and `symbol`.

For this guide, we're mostly going to focus on the JSON document with the off-chain metadata. The parts relating to keys and ownership will be covered in the [Candy machine configuration](#candy-machine-configuration) section below.

This is the basic metadata format for a very simple Metaplex NFT:

```json
{
    "name": "NFT.Storage Example #0",
    "symbol": "NFTDOT",
    "description": "A text description of this NFT",
    "image": "0.png",
    "attributes": [
        {"trait_type": "edification", "value": "100"}
    ],
    "properties": {
        "creators": [
          {"address": "N4f6zftYsuu4yT7icsjLwh4i6pB1zvvKbseHj2NmSQw", "share": 100}
        ],
        "files": [
          {"uri": "0.png", "type": "image/png"}
        ]
    }
}
```

The `name`, `symbol`, and `description` fields are standard descriptive properties that allow you to attach a human-readable name and text description to the NFT, along with a short token symbol.

The `image` field specifies the filename of the main image for the NFT. Right now it points to a local file, `0.png`, which needs to be in the same directory as this JSON file. Once the image is uploaded to NFT.Storage, `0.png` will be replaced with a link to the uploaded file before the metadata is stored.

The `attributes` array allows you to tag your NFT with various "traits", the meaning of which is entirely up to you. For example, if you're writing a game, your NFT weapons might have a "damage" `trait_type` whose `value` corresponds to the attack power of the weapon. Some art NFTs may benefit "rarity" trait to indicate how relatively unique a given NFT is compared to its collection-mates.

Finally, the `properties` field is a home for any custom metadata you want to include, but it also contains two important sub-fields, `properties.creators` and `properties.files`. 

The `properties.creators` field lists the Solana wallet addresses of each of the NFT creators. Each entry in the `properties.creators` array has a `share` that indicates how much of the sale price will go to each creator. The total of all `share` entries must sum to 100, so if there's a single creator, its share should always be 100.

The `properties.files` array contains metadata about any files associated with the NFT. Most importantly, each entry in the array contains a `type` field with the MIME content type of the file.

All NFTs that include an `image` will have at least one entry in `properties.files` with a `uri` that is equal to the value of the `image` field. As with the `image` field, this example shows a local file path, but this will be replaced with the URL for the uploaded image once it has been stored with NFT.Storage.

Please note that this example does not show all possible metadata fields. Consult the [metadata standard][metaplex-metadata-standard] for the complete specification.

## Using candy machine cli

The Candy Machine CLI is a command-line tool written in TypeScript that takes images and their associated metadata and turns them into a collection of NFTs that can be minted from an on-chain Solana Candy Machine program.

### Pre-requisites

There are a few things you'll need to set up before you can run the Candy Machine CLI, including git, Node.js, and the Solana command-line tools.

It's best to head over to the official Candy Machine [Getting Started guide][cmv2-getting-started], which is kept up to date with the current required versions of everything you'll need. 

The remainder of this guide will assume that you've installed the recommended tools and have cloned the [`metaplex` git repository](https://github.com/metaplex-foundation/metaplex) to your home folder at `~/metaplex`. 

You should also have a wallet for the Solana devnet with a few devnet SOL to play with, and this guide will assume that the key file lives at `~/.config/solana/devnet.json` as in the Getting Started guide. If your key lives elsewhere, make sure to update the example commands with the correct location.

If everything is installed correctly, you should be able to run the following command to get some help text from the cli tool:

```bash
ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts --help
```

It can be a bit awkward to type all that each time you want to run a command, so if you like, you can make an alias with your shell. The details will depend on which shell you use - for Bash and compatible shells, you can use this command to create an alias named `candy-machine`:

```bash
alias candy-machine="ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts"
```

Now you should be able to run `candy-machine --help` to see the same help output as before. To make this alias permanent, you'll need to add it to one of the configuration files for your shell, for example, `.profile` or `.bashrc`.

<Callout emoji="ℹ️">
Throughout the rest of the guide, we'll use the `candy-machine` alias to keep the examples focused on the rest of the command line arguments. If you decide not to set up an alias, remember to replace `candy-machine` with the full `ts-node ~/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts` command when running the example commands.
</Callout>

### Candy machine configuration

Each Candy Machine project that you create is defined by two things. 

First, a JSON [configuration file][cmv2-config] defines settings that apply to the entire project. This includes the price to mint an NFT from the machine (in SOL or another fungible SPL token), the Solana account that should recieve the payment, and settings related to how and when NFTs should be made available for sale.

Here's a minimal configuration file that uses NFT.Storage for uploads:

```json
{
    "price": 1.0,
    "number": 10,
    "gatekeeper": null,
    "solTreasuryAccount": "<YOUR WALLET ADDRESS>",
    "splTokenAccount": null,
    "splToken": null,
    "goLiveDate": "25 Dec 2022 00:00:00 GMT",
    "endSettings": null,
    "whitelistMintSettings": null,
    "hiddenSettings": null,
    "storage": "nft-storage",
    "nftStorageKey": "<YOUR NFT STORAGE TOKEN>",
    "ipfsInfuraProjectId": null,
    "ipfsInfuraSecret": null,
    "awsS3Bucket": null,
    "noRetainAuthority": false,
    "noMutable": false
}
```

You'll need to replace `<YOUR WALLET ADDRESS>` with the address of your solana wallet, and `<YOUR NFT STORAGE TOKEN>` with an API key for NFT.Storage.

See the [configuration documentation][cmv2-config] for details about the other arguments.

The second thing you need is a directory full of NFT assets and metadata. This directory contains a collection of images named in a numeric sequence starting at zero, e.g., `0.png`, `1.png`, etc. 

For each image file, there needs to be a corresponding `.json` file with the same number (`0.json`, etc) that includes metadata for the corresponding image. This metadata should be in the format described in the [Preparing your metadata section](#preparing-your-metadata) above.

<Callout emoji="❗">
It's important that the `number` field in your configuration JSON matches the number of NFTs in your assets directory. For example, if `number` is set to `10`, you should have ten image and metadata pairs, numbered 0 - 9.
</Callout>

### Uploading NFTs with Candy Machine

- [ ] show upload cli command and expected output
- [ ] show how to see new token in block explorer
- [ ] show how to see token metadata uri and verify metadata

### After uploading: next steps

- [ ] What to do after uploading
  - give example of running candy-machine mint command
  - mention candy machine UI
  - link to official metaplex minting docs

## Other options

- "can't someone else do it?"
    - [ ] link to Magic Eden
- "i want even more nerdy details / I'm a Solana wizard"
    - [ ] link to metaplex-auth lib, explain that you can use it with any Solana program / signing key


[concepts-decentralized-storage]: ../concepts/decentralized-storage/
[metaplex-docs-token-standard]: https://docs.metaplex.com/token-metadata/Versions/v1.0.0/nft-standard

[metaplex-token-standard]: https://docs.metaplex.com/token-metadata/specification
[cmv2-getting-started]: http://docs.metaplex.com/candy-machine-v2/getting-started
[cmv2-config]: http://docs.metaplex.com/candy-machine-v2/configuration