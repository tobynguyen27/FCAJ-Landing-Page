import { defineConfig } from 'drizzle-kit'

import { databaseUrl } from './src/infra/config'

export default defineConfig({
  out: './drizzle',
  schema: './src/infra/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
