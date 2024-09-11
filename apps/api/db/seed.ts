import dayjs from 'dayjs'

import { db, pool } from './connection'
import { goalCompletions, goals } from './schema'

async function seed() {
  try {
    await db.delete(goalCompletions)
    await db.delete(goals)
  } catch (err) {
    throw new Error(err)
  }

  const result = await db
    .insert(goals)
    .values([
      { title: 'Read 1 book per week', desiredWeeklyFrequency: 1 },
      { title: 'Exercise 3 times per week', desiredWeeklyFrequency: 3 },
      { title: 'Meditate 5 times per week', desiredWeeklyFrequency: 5 },
    ])
    .returning()

  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    ...result.map((goal) => ({
      goalId: goal.id,
      date:
        goal.title === 'Read 1 book per week'
          ? startOfWeek.toDate()
          : startOfWeek.add(1, 'day').toDate(),
    })),
  ])
}

seed().finally(() => {
  pool.end()

  process.exit(0)
})
