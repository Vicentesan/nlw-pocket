import { env } from '@in-orbit/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
