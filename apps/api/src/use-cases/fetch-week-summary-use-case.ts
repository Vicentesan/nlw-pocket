import dayjs from 'dayjs'
import { db } from 'db/connection'
import { goalCompletions, goals } from 'db/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'

export async function fetchWeekSummaryUseCase() {
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalsCreatedUpToCurrentWeek = db
    .$with('goalsCreatedUpToCurrentWeek')
    .as(
      db
        .select({
          id: goals.id,
          title: goals.title,
          desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
          createdAt: goals.createdAt,
        })
        .from(goals)
        .where(lte(goals.createdAt, lastDayOfWeek)),
    )

  const goalsCompletedInCurrentWeek = db
    .$with('goalsCompletedInCurrentWeek')
    .as(
      db
        .select({
          id: goalCompletions.id,
          title: goals.title,
          completedAt: goalCompletions.createdAt,
          completedAtDate: sql/* sql */ `DATE(${goalCompletions.createdAt})`.as(
            'completedAtDate',
          ),
        })
        .from(goalCompletions)
        .where(
          and(
            gte(goalCompletions.createdAt, firstDayOfWeek),
            lte(goalCompletions.createdAt, lastDayOfWeek),
          ),
        )
        .innerJoin(goals, eq(goals.id, goalCompletions.goalId)),
    )

  const goalsCompletedByWeekDay = db.$with('goalsCompletedByWeekDay').as(
    db
      .select({
        completedAtDate: goalsCompletedInCurrentWeek.completedAtDate,
        completions: sql/* sql */ `JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${goalsCompletedInCurrentWeek.id},
            'title', ${goalsCompletedInCurrentWeek.title},
            'completedAt', ${goalsCompletedInCurrentWeek.completedAt}
          )
        )`.as('completions'),
      })
      .from(goalsCompletedInCurrentWeek)
      .groupBy(goalsCompletedInCurrentWeek.completedAtDate),
  )

  const result = await db
    .with(
      goalsCreatedUpToCurrentWeek,
      goalsCompletedInCurrentWeek,
      goalsCompletedByWeekDay,
    )
    .select({
      completed:
        sql/* sql */ `(SELECT COUNT(*) FROM ${goalsCompletedInCurrentWeek})`.mapWith(
          Number,
        ),
      total:
        sql/* sql */ `(SELECT SUM(${goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToCurrentWeek})`.mapWith(
          Number,
        ),
      goalsPerDay: sql/* sql */ `
        JSON_OBJECT_AGG(
          ${goalsCompletedByWeekDay.completedAtDate},
          ${goalsCompletedByWeekDay.completions}
        )
      `,
    })
    .from(goalsCompletedByWeekDay)

  return { summary: result }
}
