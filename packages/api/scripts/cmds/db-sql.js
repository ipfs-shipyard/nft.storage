import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { Client } = pg

/**
 * @param {{ reset?: boolean; cargo?: boolean; testing?: boolean; }} opts
 */
export async function dbSqlCmd(opts) {
  // read all the SQL files
  const tables = fs.readFileSync(path.join(__dirname, '../../db/tables.sql'), {
    encoding: 'utf-8',
  })
  const functions = fs.readFileSync(
    path.join(__dirname, '../../db/functions.sql'),
    {
      encoding: 'utf-8',
    }
  )
  const reset = fs.readFileSync(path.join(__dirname, '../../db/reset.sql'), {
    encoding: 'utf-8',
  })
  let cargo = fs.readFileSync(path.join(__dirname, '../../db/cargo.sql'), {
    encoding: 'utf-8',
  })

  let fdw = fs.readFileSync(path.join(__dirname, '../../db/fdw.sql'), {
    encoding: 'utf-8',
  })

  // Replace secrets in the FDW sql file
  fdw = fdw.replace(":'DAG_CARGO_HOST'", `'${process.env.DAG_CARGO_HOST}'`)
  fdw = fdw.replace(
    ":'DAG_CARGO_DATABASE'",
    `'${process.env.DAG_CARGO_DATABASE}'`
  )
  fdw = fdw.replace(":'DAG_CARGO_USER'", `'${process.env.DAG_CARGO_USER}'`)
  fdw = fdw.replace(
    ":'DAG_CARGO_PASSWORD'",
    `'${process.env.DAG_CARGO_PASSWORD}'`
  )

  const client = new Client({
    connectionString: process.env.DATABASE_CONNECTION,
  })
  await client.connect()

  if (opts.reset) {
    await client.query(reset)
  }

  await client.query(tables)

  if (opts.cargo) {
    if (opts.testing) {
      cargo = cargo.replace(
        `
-- Create materialized view from cargo "aggregate_entries" table
CREATE MATERIALIZED VIEW public.aggregate_entry
AS
SELECT *
FROM cargo.aggregate_entries;`,
        `
CREATE MATERIALIZED VIEW public.aggregate_entry
AS
SELECT *
FROM cargo.aggregate_entries 
WHERE cid_v1 in ('bafybeiaj5yqocsg5cxsuhtvclnh4ulmrgsmnfbhbrfxrc3u2kkh35mts4e');
`
      )
    }

    await client.query(fdw)
    await client.query(cargo)
  }

  await client.query(functions)
  await client.end()
}
