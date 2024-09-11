import { z } from 'zod'

import { db } from '@/../db/connection'
import { goals } from '@/../db/schema'

export const createGoalRequestSchema = z.object({
  title: z.string().min(3),
  desiredWeeklyFrequency: z.number().int().min(1),
})

export const createGoalResponseSchema = z.object({
  goal: z.object({
    id: z.string().cuid2(),
    title: z.string().min(3),
    desiredWeeklyFrequency: z.number().int().min(1),
    createdAt: z.date(),
  }),
})

type CreateGoalRequest = z.infer<typeof createGoalRequestSchema>
type CreateGoalResponse = z.infer<typeof createGoalResponseSchema>

export async function createGoal({
  title,
  desiredWeeklyFrequency,
}: CreateGoalRequest): Promise<CreateGoalResponse> {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredWeeklyFrequency,
    })
    .returning()

  const goal = result[0]

  return { goal }
}
