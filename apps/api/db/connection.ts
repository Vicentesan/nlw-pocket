import { env } from '@in-orbit/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

export const pool = postgres(env.DATABASE_URL)

export const db = drizzle(pool, {
  schema,
  logger: true,
})
