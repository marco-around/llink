import type { FastifyInstance } from "fastify"
import z from "zod"

export async function healthCheckRoute(fastify: FastifyInstance) {
	fastify.get(
		"/health",
		{
			schema: {
				summary: "Health check",
				description: "Health check endpoint to test if service is running",
				response: {
					200: z.object({
						message: z.string(),
					}),
				},
			},
		},
		() => {
			return "Ok"
		}
	)
}
