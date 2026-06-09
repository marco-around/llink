import "dotenv/config"

import fastifyRedis from "@fastify/redis"
import fastifySwagger from "@fastify/swagger"
import {
	jsonSchemaTransform,
	jsonSchemaTransformObject,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "@fastify/type-provider-zod"
import scalarFastifyApiReference from "@scalar/fastify-api-reference"
import fastify from "fastify"
import { env } from "./env.js"
import { cassandraPlugin } from "./plugins/cassandra.js"
import { routes } from "./routes/index.js"

const server = fastify({
	logger: {
		level: env.LOG_LEVEL,
		transport:
			env.NODE_ENV === "development"
				? {
						target: "pino-pretty",
						options: {
							translateTime: "HH:MM:ss",
							ignore: "pid,hostname",
						},
					}
				: undefined,
	},
}).withTypeProvider<ZodTypeProvider>()

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

server.register(fastifySwagger, {
	openapi: {
		info: {
			title: "llink API reference",
			description: "API Reference of the Link shortener service llink",
			version: "0.1.0",
		},
		servers: [
			{
				url:
					env.NODE_ENV === "development"
						? env.BASE_URL
						: "https://api.exemple.com/v1",
				description: env.NODE_ENV,
			},
		],
	},
	transform: jsonSchemaTransform,
	transformObject: jsonSchemaTransformObject,
})

server.register(fastifyRedis, {
	port: env.REDIS_PORT,
	host: env.REDIS_HOST,
	closeClient: true,
})

server.register(scalarFastifyApiReference, {
	configuration: {
		theme: "laserwave",
	},
})

server.register(cassandraPlugin, {
	cassandra: {
		contactPoints: env.CASSANDRA_CONTACT_POINTS,
		localDataCenter: env.CASSANDRA_DATACENTER,
		keyspace: env.CASSANDRA_KEYSPACE,
	},
})

server.register(routes)

async function close() {
	try {
		server.log.info("Shutting down the server...")

		await server.close()
	} catch (error) {
		server.log.error(error)
		process.exit(1)
	}
}

process.on("SIGINT", close)
process.on("SIGTERM", close)

try {
	await server.listen({ port: env.PORT, host: env.HOST })
	server.log.info(`API Reference available at ${env.BASE_URL}/reference`)
} catch (error) {
	server.log.error(error)
	process.exit(1)
}
