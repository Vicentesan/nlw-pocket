import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  createGoalRequestSchema,
  createGoalResponseSchema,
  createGoalUseCase,
} from '@/use-cases/create-goal-use-case'

export function createGoalRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/goals',
    {
      schema: {
        tags: ['goals'],
        summary: 'Create a goal',
        body: z.object({
          ...createGoalRequestSchema.shape,
        }),
        response: {
          201: z.object({
            ...createGoalResponseSchema.shape,
          }),
        },
      },
    },
    async (req, res) => {
      const { title, desiredWeeklyFrequency } = req.body

      const { goal } = await createGoalUseCase({
        title,
        desiredWeeklyFrequency,
      })

      return res.status(201).send({ goal })
    },
  )
}
