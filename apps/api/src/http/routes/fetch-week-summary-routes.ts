import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  fetchWeekSummaryUseCase,
  fetchWeekSummaryUseCaseResponse,
} from '@/use-cases/fetch-week-summary-use-case'

export async function fetchWeekSummaryRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/goals/summary',
    {
      schema: {
        tags: ['goals'],
        summary: 'Fetch week goals summary',
        response: {
          200: z.object({
            ...fetchWeekSummaryUseCaseResponse.shape,
          }),
        },
      },
    },
    async (_, res) => {
      const { summary } = await fetchWeekSummaryUseCase()

      return res.status(200).send({ summary })
    },
  )
}
