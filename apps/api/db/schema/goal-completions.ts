import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { goals } from './goals'

export const goalCompletions = pgTable('goalCompletions', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  goalId: text('goalId')
    .references(() => goals.id)
    .notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
