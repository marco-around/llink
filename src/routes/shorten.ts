import type { ZodTypeProvider } from "@fastify/type-provider-zod"
import type { FastifyInstance } from "fastify"
import z from "zod"
import { env } from "../env.js"
import { DatabaseError, ShortcodeGenerationError } from "../errors/index.js"

export async function shorten(fastify: FastifyInstance) {
	fastify.withTypeProvider<ZodTypeProvider>().post(
		"/shorten",
		{
			config: {
				rateLimit: {
					max: 10,
					timeWindow: "1 minute",
				},
			},
			schema: {
				summary: "Create a new short URL",
				description:
					"This route take a original URL and return a new short URL.",
				body: z.object({
					url: z.url(),
				}),
				response: {
					201: z.object({
						shortUrl: z.url(),
					}),
				},
			},
		},
		async (req, reply) => {
			let shortcode: string

			try {
				shortcode = await fastify.shortcodeIdGenerator.nextShortcode()
			} catch (error) {
				throw new ShortcodeGenerationError(
					error instanceof Error ? error : undefined
				)
			}

			try {
				await fastify.cassandra.execute(
					`INSERT INTO ${env.CASSANDRA_KEYSPACE}.urls (shortcode, original_url, created_at) VALUES (?, ?, ?)`,
					[shortcode, req.body.url, new Date()]
				)
			} catch (error) {
				throw new DatabaseError(
					"insert",
					error instanceof Error ? error : undefined
				)
			}

			return reply.code(201).send({ shortUrl: `${env.BASE_URL}/${shortcode}` })
		}
	)
}
