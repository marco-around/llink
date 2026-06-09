import type { ZodTypeProvider } from "@fastify/type-provider-zod"
import type { FastifyInstance } from "fastify"
import z from "zod"
import { env } from "../env.js"
import { shortcodeIdGenerator } from "../utils/shorcode-id-generator.js"
import { sqids } from "../utils/sqids.js"

export async function shorten(fastify: FastifyInstance) {
	fastify.withTypeProvider<ZodTypeProvider>().post(
		"/shorten",
		{
			schema: {
				summary: "Create a new short URL",
				description: "Create a new short URL",
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
			try {
				const id = await shortcodeIdGenerator(fastify.redis).nextId()

				const shortcode = sqids.encode([id])

				await fastify.cassandra.execute(
					`INSERT INTO llink.urls (shortcode, original_url, created_at) VALUES (?, ?, ?)`,
					[shortcode, req.body.url, new Date()]
				)

				reply.code(201).send({ shortUrl: `${env.BASE_URL}/${shortcode}` })
			} catch (error) {
				fastify.log.error(error)
				// better error handling in future!
				throw new Error()
			}
		}
	)
}
