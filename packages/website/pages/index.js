import { useCallback } from 'react'

import countly from '../lib/countly.js'
import Hero from '../components/hero.js'
import HashLink from '../components/hashlink.js'
import Step from '../components/step.js'
import Box from '../components/box.js'
import Link from 'next/link'
/**
 * Static Props
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      needsUser: false,
    },
  }
}

/**
 * Home Component
 *
 */
export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <About />
        <GettingStarted />
        <FAQ />
      </main>
    </>
  )
}

function About() {
  const storeText = (
    <>
      <h2 className="chicagoflf">
        <HashLink id="store">Store</HashLink>
      </h2>
      <p className="lh-copy">
        Just upload your data and you&#39;ll receive an IPFS hash of the content
        (a CID) that can be used in <strong>on-chain</strong> NFT data as a
        pointer to the content.
      </p>
      <p className="lh-copy">
        Filecoin provides long term storage for the data ensuring that even if{' '}
        <strong>nft.storage</strong> is attacked or taken down the NFT data
        persists!
      </p>
    </>
  )
  const retrieveText = (
    <>
      <h2 className="chicagoflf">
        <HashLink id="retrieve">Retrieve</HashLink>
      </h2>
      <p className="lh-copy">
        NFT data stored by <strong>nft.storage</strong> can be accessed from the
        decentralized IPFS network from <em>any</em> peer that has the content.
        CIDs reference <strong>immutable</strong> content so you can be sure the
        content you access is the content referenced in the NFT.
      </p>
      <p className="lh-copy">
        The data can be fetched directly in the browser using{' '}
        <a
          href="https://brave.com/ipfs-support/"
          className="black"
          target="_blank"
          rel="noopener noreferrer"
        >
          Brave
        </a>
        , or via a{' '}
        <a
          href="https://docs.ipfs.io/concepts/ipfs-gateway/#public-gateways"
          className="black"
          target="_blank"
          rel="noopener noreferrer"
        >
          public IPFS gateway
        </a>
        , or by using{' '}
        <a
          href="https://github.com/ipfs-shipyard/ipfs-desktop"
          className="black"
          target="_blank"
          rel="noopener noreferrer"
        >
          IPFS Desktop
        </a>{' '}
        or the{' '}
        <a
          href="https://docs.ipfs.io/how-to/command-line-quick-start/"
          className="black"
          target="_blank"
          rel="noopener noreferrer"
        >
          IPFS command line
        </a>
        .
      </p>
    </>
  )
  return (
    <article className="bg-nsgreen">
      <div className="mw9 center pa4 pa5-ns">
        <h1 className="chicagoflf">
          <HashLink id="about">About</HashLink>
        </h1>
        <p className="lh-copy mw-none mw-none-m mw6-ns">
          <strong>nft.storage</strong> is a brand new service, built
          specifically for storing <strong>off-chain</strong> NFT data. Data is
          stored <em>decentralized</em> on{' '}
          <a href="https://ipfs.io" className="black">
            IPFS
          </a>{' '}
          and{' '}
          <a href="https://filecoin.io" className="black">
            Filecoin
          </a>
          .
        </p>
        <div className="db db-m dn-ns">
          <div>
            {storeText}
            <div className="tc mv4">
              <img
                src="images/diagram-store.png"
                alt="diagram of storage with nft.storage"
                width="1152"
                height="1650"
                style={{ maxWidth: '576px', height: 'auto', width: '100%' }}
              />
            </div>
          </div>
          <div>
            {retrieveText}
            <div className="tc mv4">
              <img
                src="images/diagram-retrieve.png"
                alt="diagram of retrieval with nft.storage"
                width="1262"
                height="1260"
                style={{ maxWidth: '631px', height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
        <div className="relative dn dn-m db-ns">
          <div className="tr pl5">
            <img
              src="images/diagram-store-and-retrieve.png"
              srcSet="images/diagram-store-and-retrieve@2x.png 2x"
              alt="diagram of storage and retrieval with nft.storage"
              width="1177"
              style={{ width: '1177px', height: 'auto' }}
            />
          </div>
          <div className="absolute top-0 w-100 h-100 flex">
            <div className="flex-auto w-50">
              <div className="pt6 pr4">{storeText}</div>
            </div>
            <div className="flex-none" style={{ width: 400 }} />
            <div className="flex-auto flex items-center w-50">
              <div>{retrieveText}</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function GettingStarted() {
  const onClickHandler = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.CTA_LINK_CLICK,
      event.currentTarget,
      {
        ui: countly.ui.HOME_GET_STARTED,
      }
    )
  }, [])

  const jsEx = `import { NFTStorage, File } from 'nft.storage'

const apiKey = 'YOUR_API_KEY'
const client = new NFTStorage({ token: apiKey })

const metadata = await client.store({
  name: 'Pinpie',
  description: 'Pin is not delicious beef!',
  image: new File([/* data */], 'pinpie.jpg', { type: 'image/jpg' })
})
console.log(metadata.url)
// ipfs://bafyreib4pff766vhpbxbhjbqqnsh5emeznvujayjj4z2iu533cprgbz23m/metadata.json`

  const curlEx = `curl -X POST --data-binary @art.jpg -H 'Authorization: Bearer YOUR_API_KEY' https://api.nft.storage/upload`

  const uploadResp = `{
  "ok": true,
  "value": { "cid": "bafy..." }
}`

  return (
    <article className="bg-yellow">
      <div className="mw9 center pa4 pa5-ns">
        <h1 className="chicagoflf tc mb5">
          <HashLink id="getting-started">Getting started</HashLink>
        </h1>
        <ol className="list tc pl0 mb5">
          <li>
            <Step>1</Step>
            <p className="chicagoflf f3 mw6 center">
              <Link href="/login">
                <a
                  className="no-underline underline-hover nsnavy"
                  onClick={onClickHandler}
                >
                  Register an nft.storage account
                </a>
              </Link>{' '}
              so that you can create API access keys.
            </p>
            <img
              width="29px"
              height="66px"
              src="images/icon-arrow-down.svg"
              alt="arrow down"
              className="mb3"
            />
          </li>
          <li>
            <Step>2</Step>
            <p className="chicagoflf f3 mw6 center">
              <Link href="/manage">
                <a
                  className="no-underline underline-hover nsnavy"
                  onClick={onClickHandler}
                >
                  Create an API access key
                </a>
              </Link>{' '}
              and note it down.
            </p>
            <img
              width="29px"
              height="66px"
              src="images/icon-arrow-down.svg"
              alt="arrow down"
              className="mb3"
            />
          </li>
          <li>
            <Step>3</Step>
            <p className="chicagoflf f3 mw6 center">
              Choose a method to get your NFT data stored:
            </p>
          </li>
        </ol>
        <div
          id="docs"
          className="db-m flex-ns justify-center center mw9 mw-none-m mw-none-ns mh-3"
        >
          <Box
            bgColor="nspeach"
            borderColor="nsnavy"
            wrapperClassName="w-100 w-100-m w-50-ns mh0 mh0-m mh3-ns mb4"
          >
            <h2 className="chicagoflf f5 fw4">
              <HashLink id="js-client-library">JS Client Library</HashLink>
            </h2>
            <p className="lh-copy">
              Install the{' '}
              <a
                href="https://npmjs.org/package/nft.storage"
                target="_blank"
                rel="noopener noreferrer"
                className="black"
              >
                JS library
              </a>
              :
            </p>
            <pre className="f6 lh-copy white bg-nsnavy pa3 br1 ba b--black code overflow-x-scroll">
              npm install nft.storage
            </pre>
            <p className="lh-copy">Use the client in Node.js or the browser:</p>
            <pre className="f6 lh-copy white bg-nsnavy pa3 br1 ba b--black code overflow-x-scroll">
              {jsEx}
            </pre>
            <p className="lh-copy">
              View the{' '}
              <a
                href="https://ipfs-shipyard.github.io/nft.storage/client/"
                target="_blank"
                rel="noopener noreferrer"
                className="black"
              >
                full library reference docs
              </a>
              .
            </p>
          </Box>
          <Box
            bgColor="nspeach"
            borderColor="nspink"
            wrapperClassName="w-100 w-100-m w-50-ns mh0 mh0-m mh3-ns mb4"
          >
            <h2 className="chicagoflf f5 fw4">
              <HashLink id="raw-http-request">Raw HTTP Request</HashLink>
            </h2>
            <p className="lh-copy">
              Configure your HTTP client and set the{' '}
              <code className="f6 bg-nspink ph2 pv1 br1 ba b--black code">
                Authorization
              </code>{' '}
              header:
            </p>
            <pre className="f6 lh-copy bg-nspink pa3 br1 ba b--black code overflow-x-scroll">
              &quot;Authorization&quot;: &quot;Bearer YOUR_API_KEY&quot;
            </pre>
            <p className="lh-copy">
              Submit a HTTP{' '}
              <code className="f6 bg-nspink ph2 pv1 br1 ba b--black code">
                POST
              </code>{' '}
              request to{' '}
              <a href="https://api.nft.storage/upload" className="black">
                api.nft.storage/upload
              </a>
              , passing the file data in the request body. e.g.
            </p>
            <pre className="f6 lh-copy bg-nspink pa3 br1 ba b--black code overflow-x-scroll">
              {curlEx}
            </pre>
            <p className="lh-copy">
              Successful requests will receive a HTTP{' '}
              <code className="f6 bg-nspink ph2 pv1 br1 ba b--black code">
                200
              </code>{' '}
              status and{' '}
              <code className="f6 bg-nspink ph2 pv1 br1 ba b--black code">
                application/json
              </code>{' '}
              response like:
            </p>
            <pre className="f6 lh-copy bg-nspink pa3 br1 ba b--black code overflow-x-scroll">
              {uploadResp}
            </pre>
            <p className="lh-copy">
              Check the{' '}
              <Link href="/api-docs">
                <a className="black">API Docs</a>
              </Link>{' '}
              for information on uploading multiple files and the other
              available endpoints.
            </p>
          </Box>
          {/* <Box
            bgColor="nspeach"
            borderColor="nsred"
            wrapperClassName="w-100 w-100-m w-33-ns mh0 mh0-m mh3-ns mb4"
          >
            <h2 className="chicagoflf f5 fw4">
              <HashLink id="configure-as-a-remote-pinning-service">
                Configure as a Remote Pinning Service
              </HashLink>
            </h2>
            <p className="lh-copy">
              You can use <strong>nft.storage</strong> as a{' '}
              <a
                href="https://ipfs.github.io/pinning-services-api-spec"
                className="black"
              >
                remote pinning service
              </a>{' '}
              in IPFS.
            </p>
            <pre className="f6 lh-copy white bg-nsred pa3 br1 ba b--black code overflow-x-scroll">
              ipfs pin remote service add nft-storage https://api.nft.storage
              YOUR_API_KEY
            </pre>
            <p className="lh-copy">
              Use the{' '}
              <code className="f6 white bg-nsred ph2 pv1 br1 ba b--black code">
                --help
              </code>{' '}
              option for information on other remote pinning service commands:
            </p>
            <pre className="f6 lh-copy white bg-nsred pa3 br1 ba b--black code overflow-x-scroll">
              ipfs pin remote --help
            </pre>
          </Box> */}
        </div>
      </div>
    </article>
  )
}

function FAQ() {
  return (
    <article className="bg-nsforest">
      <div className="mw9 center pa4 pa5-ns">
        <h1 className="chicagoflf white">
          <HashLink id="faq">FAQ</HashLink>
        </h1>
        <h2 className="chicagoflf white">
          <HashLink id="what-is-the-long-term-vision-for-nftstorage">
            What is the long-term vision for NFT.Storage?
          </HashLink>
        </h2>
        <p className="lh-copy white">
          NFT.Storage fills the gap for NFT developers <strong>today </strong>
          who are looking for easy APIs and best practices for storing their NFT
          data securely and resiliently. In the long-term, NFT.Storage will
          hopefully decentralize itself out of existence, upgrading today&apos;s
          implementation into the provably permanent storage solutions of
          tomorrow.
        </p>
        <h2 className="chicagoflf white">
          <HashLink id="how-long-will-data-be-stored-on-nftstorage">
            How long will data be stored on NFT.storage?
          </HashLink>
        </h2>
        <p className="lh-copy white">
          Data will be available in IPFS indefinitely as well as stored in
          long-term, redundant Filecoin storage deals with the global community
          of miners. See the{' '}
          <Link href="/terms">
            <a className="white">Terms of Service</a>
          </Link>{' '}
          for details.
        </p>
        <h2 className="chicagoflf white">
          <HashLink id="are-there-any-size-restrictions-for-stored-nfts">
            Are there any size restrictions for stored NFTs?
          </HashLink>
        </h2>
        <p className="lh-copy white">
          NFT.storage can store NFTs up to <strong>32GB </strong>
          in size! (There was previously a 100MB limit due to Cloudflare workers
          but NFT.storage now supports chunked uploads, allowing files bigger
          than 100MB to be uploaded! 🎉)
        </p>
        <h2 className="chicagoflf white">
          <HashLink id="where-can-i-learn-more-about-nft-best-practices">
            Where can I learn more about NFT best practices?
          </HashLink>
        </h2>
        <p className="lh-copy white">
          Visit{' '}
          <a href="https://nftschool.dev" className="white">
            NFT School
          </a>{' '}
          for information on NFT best practices as well as a variety of helpful
          tutorials and how-to guides for NFT developers.
        </p>
      </div>
    </article>
  )
}
