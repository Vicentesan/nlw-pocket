import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  fetchWeekPendingGoalsUseCase,
  fetchWeekPendingGoalsUseCaseResponseSchema,
} from '@/use-cases/fetch-week-pending-goals-use-case'

export async function fetchWeekPendingGoalsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/pending-goals',
    {
      schema: {
        tags: ['goals'],
        summary: 'Fetch week pending goals',
        response: {
          200: z.object({
            ...fetchWeekPendingGoalsUseCaseResponseSchema.shape,
          }),
        },
      },
    },
    async (_, res) => {
      const { pendingGoals } = await fetchWeekPendingGoalsUseCase()

      return res.status(200).send({ pendingGoals })
    },
  )
}
