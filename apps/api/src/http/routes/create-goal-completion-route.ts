import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  createGoalCompletionUseCase,
  createGoalCompletionUseCaseRequestSchema,
} from '@/use-cases/create-goal-completion-use-case'

export async function createGoalCompletionRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/completions',
    {
      schema: {
        tags: ['goals'],
        summary: 'Complete a goal',
        body: z.object({
          // here, we should use params... but when we use it the zod doesn't recognize the goalId as a cuid2
          ...createGoalCompletionUseCaseRequestSchema.shape,
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (req, res) => {
      const { goalId } = req.body

      await createGoalCompletionUseCase({ goalId })

      return res.status(204).send()
    },
  )
}
