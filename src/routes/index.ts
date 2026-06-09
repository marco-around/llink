import type { FastifyInstance } from "fastify"
import { healthCheckRoute } from "./health-check.js"
import { redirect } from "./redirect.js"
import { shorten } from "./shorten.js"

export async function routes(fastify: FastifyInstance) {
	fastify.register(healthCheckRoute)
	fastify.register(shorten)
	fastify.register(redirect)
}
