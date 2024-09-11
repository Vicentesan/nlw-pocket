import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  createGoalCompletionUseCase,
  createGoalCompletionUseCaseRequestSchema,
} from '@/use-cases/create-goal-completion-use-case'

export async function createGoalCompletionRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/goals/:goalId/completions',
    {
      schema: {
        tags: ['goals'],
        summary: 'Complete a goal',
        params: z.object({
          ...createGoalCompletionUseCaseRequestSchema.shape,
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (req, res) => {
      const { goalId } = req.params

      await createGoalCompletionUseCase({ goalId })

      return res.status(204).send()
    },
  )
}
