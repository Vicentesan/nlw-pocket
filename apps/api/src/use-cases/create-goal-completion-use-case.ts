import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/../db/connection'
import { goalCompletions, goals } from '@/../db/schema'
import { BadRequestError } from '@/http/_errors/bad-request-errors'

export const createGoalCompletionUseCaseRequestSchema = z.object({
  goalId: z.string().cuid2(),
})

export const createGoalCompletionUseCaseResponseSchema = z.object({
  goalId: z.string().cuid2(),
})

type CreateGoalCompletionUseCaseRequest = z.infer<
  typeof createGoalCompletionUseCaseRequestSchema
>

type CreateGoalCompletionUseCaseResponse = z.infer<
  typeof createGoalCompletionUseCaseResponseSchema
>

export async function createGoalCompletionUseCase(
  props: CreateGoalCompletionUseCaseRequest,
): Promise<CreateGoalCompletionUseCaseResponse> {
  const { goalId } = createGoalCompletionUseCaseRequestSchema.parse({
    ...props,
  })

  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalCompletionCounts = db.$with('goalCompletionCounts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          eq(goalCompletions.goalId, goalId),
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
        ),
      )
      .groupBy(goalCompletions.goalId),
  )

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql/* sql */ `
      COALESCE(${goalCompletionCounts.completionCount}, 0)
    `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)
  if (result.length <= 0) throw new BadRequestError('Goal not found')

  const { completionCount, desiredWeeklyFrequency } = result[0]

  console.log(result)

  if (completionCount >= desiredWeeklyFrequency)
    throw new BadRequestError('Goal has already been completed for this week')

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()
  const goalCompletion = insertResult[0]

  console.log(goalCompletion)

  return createGoalCompletionUseCaseResponseSchema.parse({
    goalId: goalCompletion.goalId,
  })
}
