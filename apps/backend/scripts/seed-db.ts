import * as schema from '@fcaj/schema'
import { consola } from 'consola'
import { drizzle } from 'drizzle-orm/bun-sql'
import { reset, seed } from 'drizzle-seed'

import { databaseUrl } from '../src/infra/config'

async function main() {
  const db = drizzle(databaseUrl)

  await reset(db, schema)
  await seed(db, schema)
}

main().then(() => {
  consola.success('Seeding database successfully')
})
