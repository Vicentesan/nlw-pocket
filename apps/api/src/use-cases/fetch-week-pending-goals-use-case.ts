import dayjs from 'dayjs'
import { db } from 'db/connection'
import { goalCompletions, goals } from 'db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

export const fetchWeekPendingGoalsUseCaseResponseSchema = z.object({
  pendingGoals: z.array(
    z.object({
      id: z.string().cuid2(),
      title: z.string().min(3),
      desiredWeeklyFrequency: z.number().int().min(1),
      goalCompletionCount: z.number().int().min(0).default(0),
      createdAt: z.date(),
    }),
  ),
})

type FetchWeekPendingGoalsUseCaseResponse = z.infer<
  typeof fetchWeekPendingGoalsUseCaseResponseSchema
>

export async function fetchWeekPendingGoalsUseCase(): Promise<FetchWeekPendingGoalsUseCaseResponse> {
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

  const goalCompletionCounts = db.$with('goalCompletionCounts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
        ),
      )
      .groupBy(goalCompletions.goalId),
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToCurrentWeek, goalCompletionCounts)
    .select({
      id: goalsCreatedUpToCurrentWeek.id,
      title: goalsCreatedUpToCurrentWeek.title,
      desiredWeeklyFrequency:
        goalsCreatedUpToCurrentWeek.desiredWeeklyFrequency,
      goalCompletionCount: sql/* sql */ `
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
      createdAt: goalsCreatedUpToCurrentWeek.createdAt,
    })
    .from(goalsCreatedUpToCurrentWeek)
    .leftJoin(
      goalCompletionCounts,
      eq(goalCompletionCounts.goalId, goalsCreatedUpToCurrentWeek.id),
    )

  return fetchWeekPendingGoalsUseCaseResponseSchema.parse({
    pendingGoals,
  })
}
