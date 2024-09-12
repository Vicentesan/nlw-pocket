import dayjs from 'dayjs'
import { db } from 'db/connection'
import { goalCompletions, goals } from 'db/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

const goalsPerDaySchema = z.record(
  z
    .object({
      id: z.string(),
      title: z.string(),
      completedAt: z.coerce.date(),
    })
    .array(),
)

export const fetchWeekSummaryUseCaseResponse = z.object({
  summary: z.object({
    completed: z.number().int(),
    total: z.number().int(),
    goalsPerDay: goalsPerDaySchema,
  }),
})

type FetchWeekSummaryUseCaseResponse = z.infer<
  typeof fetchWeekSummaryUseCaseResponse
>

export async function fetchWeekSummaryUseCase(): Promise<FetchWeekSummaryUseCaseResponse> {
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

  const summary = await db
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

  try {
    const parsedSummary = fetchWeekSummaryUseCaseResponse.parse({
      summary: summary[0],
    })

    return parsedSummary
  } catch (error) {
    throw new Error(error as string)
  }
}
