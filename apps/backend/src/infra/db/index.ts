import { drizzle } from 'drizzle-orm/bun-sql'

import { databaseUrl } from '../config'

export const db = drizzle(databaseUrl)
