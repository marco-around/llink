import type { FastifyInstance } from "fastify"
import { healthCheckRoute } from "./health-check.js"
import { redirect } from "./redirect.js"
import { shorten } from "./shorten.js"

export async function rootRoutes(fastify: FastifyInstance) {
	fastify.register(healthCheckRoute)
	fastify.register(redirect)
}

export async function apiRoutes(fastify: FastifyInstance) {
	fastify.register(shorten)
}
