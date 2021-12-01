const { CarReader } = require('@ipld/car')

/**
 * https://github.com/sinedied/smoke#javascript-mocks
 * @typedef {{ buffer: Buffer, originalname: string }} MultrFile
 * @param {{ query: Record<string, string>, files: MultrFile[] }} request
 */
module.exports = async ({ query, files }) => {
  const car = await CarReader.fromBytes(files[0].buffer)
  const roots = await car.getRoots()
  let dagSize = 0
  for await (const block of car.blocks()) {
    dagSize += block.bytes.length
  }
  const result = {
    cid: {
      '/': String(roots[0]),
    },
    name: files[0].originalname,
    // car uploads may not be unixfs, so get a bytes property instead of `size` https://github.com/ipfs/ipfs-cluster/issues/1362
    bytes: dagSize,
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: query['stream-channels'] === 'false' ? [result] : result,
  }
}
