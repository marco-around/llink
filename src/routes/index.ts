import type { FastifyInstance } from "fastify"
import { healthCheckRoute } from "./health-check.js"

export async function routes(fastify: FastifyInstance) {
	fastify.register(healthCheckRoute)
}
