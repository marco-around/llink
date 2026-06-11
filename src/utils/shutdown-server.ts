import type { FastifyInstance } from "fastify"

export async function shutdownServer(fastify: FastifyInstance) {
	try {
		fastify.log.info("Shutting down the server...")

		await fastify.close()
	} catch (error) {
		fastify.log.error(error)
		process.exit(1)
	}
}
