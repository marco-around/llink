import type { Client } from "cassandra-driver"

declare module "fastify" {
	interface FastifyInstance {
		cassandra: Client
		shortcodeIdGenerator: {
			nextShortcode: () => Promise<string>
		}
	}
}
