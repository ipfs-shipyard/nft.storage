import execa from 'execa'
import { dbCmd } from './db.js'
import delay from 'delay'
import { dbSqlCmd } from './db-sql.js'

export async function dbTypesCmd() {
  const project = `nft-storage-db-types-${Date.now()}`
  await dbCmd({ start: true, project })
  await delay(2000)

  try {
    await dbSqlCmd({ cargo: true, testing: true })
    const url = `${process.env.DATABASE_URL}/?apikey=${process.env.DATABASE_TOKEN}`
    await execa(
      'openapi-typescript',
      [url, '--output', 'src/utils/db-types.d.ts'],
      {
        preferLocal: true,
      }
    )
  } finally {
    await dbCmd({ clean: true, project })
  }
}
