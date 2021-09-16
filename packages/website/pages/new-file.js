import { getToken, API } from '../lib/api'
import { useRouter } from 'next/router'
import { NFTStorage } from 'nft.storage'
import { packToBlob } from 'ipfs-car/pack/blob'
import { useQueryClient } from 'react-query'
import { useState } from 'react'
import { When } from 'react-if'
import Box from '../components/box.js'
import Alert from '../components/alert.js'
import Button from '../components/button.js'
import Link from 'next/link'

export function getStaticProps() {
  return {
    props: {
      title: 'New NFT - NFT Storage',
      navBgColor: 'bg-nsyellow',
      redirectTo: '/',
      needsUser: true,
    },
  }
}

export default function NewFile() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [isCar, setIsCar] = useState(false)
  const [percentComplete, setPercentComplete] = useState(0)
  const [error, setError] = useState('')

  /**
   * @param {import('react').ChangeEvent<HTMLInputElement>} e
   */
  function checkCar(e) {
    const file = e.target.files && e.target.files[0]
    if (file && file.name.endsWith('.car')) {
      setIsCar(true)
    } else {
      setIsCar(false)
    }
  }

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function handleUploadSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const file = data.get('file')
    if (file && file instanceof File) {
      const client = new NFTStorage({
        token: await getToken(),
        endpoint: new URL(API),
      })
      setUploading(true)
      try {
        /** @type File|Blob */
        let car
        if (isCar) {
          car = file
        } else {
          ;({ car } = await packToBlob({ input: [file] }))
        }
        let totalBytesSent = 0
        await client.storeCar(car, {
          onStoredChunk: (size) => {
            totalBytesSent += size
            setPercentComplete(Math.round((totalBytesSent / car.size) * 100))
          },
        })

        router.push('/files')
        setError('')
      } catch (/** @type any */ err) {
        console.error(err)
        setError(
          `Error uploading (${err.message}). Check the console for more details`
        )
      } finally {
        await queryClient.invalidateQueries('get-nfts')
        setUploading(false)
      }
    }
  }

  return (
    <main className="bg-nsyellow">
      <div className="mw9 center pv3 ph3 ph5-ns min-vh-100">
        <Box
          bgColor="nsgray"
          borderColor="nspink"
          wrapperClassName="center mv4 mw6"
        >
          <h1 className="chicagoflf f4 fw4">Upload File</h1>
          <form onSubmit={handleUploadSubmit}>
            <div className="mv3">
              <label htmlFor="name" className="dib mb2">
                File:
              </label>
              <input
                id="file"
                name="file"
                type="file"
                className="db ba b--black w5 pa2"
                required
                onChange={checkCar}
              />
            </div>
            <label>
              <input
                id="is-car"
                name="is-car"
                type="checkbox"
                checked={isCar}
                readOnly
              />
              <span className="ml2">is CAR?</span>
            </label>
            <details className="db mt3 mb4">
              <summary className="i pointer">
                CAR files supported! What is a CAR?
              </summary>
              <p className="pl3 mt3 lh-copy">
                A CAR is a Content Addressed Archive that allows you to
                pre-compute the root CID for your assets. You can pack your
                assets into a CAR with the{' '}
                <a
                  className="black"
                  href="https://github.com/vasco-santos/ipfs-car"
                  target="_blank"
                  rel="noreferrer"
                >
                  <code>ipfs-car</code>
                </a>{' '}
                cli or via{' '}
                <a
                  className="black"
                  href="https://car.ipfs.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://car.ipfs.io
                </a>
                .
              </p>
              <p className="pl3 mt2 lh-copy">
                Give your CAR filename the <code>.car</code> extention, and when
                it&apos;s uploaded to nft.storge your asset will be stored with
                the exact same root CID as defined in the CAR file.
              </p>
            </details>
            <div className="mv3">
              <Button
                className="bg-nslime"
                type="submit"
                disabled={uploading}
                id="upload-file"
              >
                {uploading
                  ? `Uploading...${
                      percentComplete ? `(${percentComplete}%)` : ''
                    }`
                  : 'Upload'}
              </Button>
            </div>
            <div>
              <p className="lh-copy f7">
                You can also upload files using the{' '}
                <Link href="/#js-client-library">
                  <a className="black">JS Client Library</a>
                </Link>
                ,{' '}
                <Link href="/#raw-http-request">
                  <a className="black">Raw HTTP Requests</a>
                </Link>{' '}
                or via the{' '}
                <Link href="/#configure-as-a-remote-pinning-service">
                  <a className="black">Remote Pinning Service API</a>
                </Link>
                .
              </p>
            </div>
          </form>
        </Box>
        <When condition={error !== ''}>
          <Alert
            className="pa4 white"
            position="bottom"
            type="error"
            timer={4}
            onTimerEnd={() => setError('')}
          >
            <>
              {error}{' '}
              <button
                className="border ml2 br-100 b--transparent pointer"
                onClick={() => setError('')}
              >
                X
              </button>
            </>
          </Alert>
        </When>
      </div>
    </main>
  )
}
