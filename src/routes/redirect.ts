import type { ZodTypeProvider } from "@fastify/type-provider-zod"
import type { FastifyInstance } from "fastify"
import z from "zod"
import { env } from "../env.js"
import {
	DatabaseError,
	ServerError,
	ShortcodeNotFoundError,
} from "../errors/index.js"

export async function redirect(fastify: FastifyInstance) {
	fastify.withTypeProvider<ZodTypeProvider>().get(
		"/:shortcode",
		{
			config: {
				rateLimit: {
					max: 100,
					timeWindow: "1 minute",
				},
			},
			schema: {
				summary: "Redirect to original URL",
				description:
					"This route get the original URL from the shortcode and redirects the user to it.",
				params: z.object({
					shortcode: z.string().length(7),
				}),
				response: {
					301: z.null(),
					404: z.null(),
				},
			},
		},
		async (req, reply) => {
			try {
				const result = await fastify.cassandra.execute(
					`SELECT original_url FROM ${env.CASSANDRA_KEYSPACE}.urls WHERE shortcode = ?`,
					[req.params.shortcode]
				)

				const row = result.first()

				if (!row) {
					throw new ShortcodeNotFoundError(req.params.shortcode)
				}

				const originalUrl = row.get("original_url") as string

				return reply.redirect(originalUrl, 301)
			} catch (error) {
				if (error instanceof ServerError) {
					throw error
				}

				throw new DatabaseError(
					"select",
					error instanceof Error ? error : undefined
				)
			}
		}
	)
}
