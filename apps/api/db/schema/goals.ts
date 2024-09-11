import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const goals = pgTable('goals', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text('title').notNull(),
  desiredWeeklyFrequency: integer('desiredWeeklyFrequency').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
