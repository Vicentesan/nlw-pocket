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

  await db
    .insert(goalCompletions)
    .values([...result.map((goal) => ({ goalId: goal.id }))])
}

seed().finally(() => pool.end)
