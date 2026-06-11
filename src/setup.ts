import fastifyCors from "@fastify/cors"
import fastifyRateLimit from "@fastify/rate-limit"
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
import fastify, { type FastifyError, type FastifyServerOptions } from "fastify"
import { env } from "./env.js"
import { ServerError } from "./errors/index.js"
import { cassandraPlugin } from "./plugins/cassandra.js"
import { shortcodeIdGeneratorPlugin } from "./plugins/shortcode-id-generator.js"
import { apiRoutes, rootRoutes } from "./routes/index.js"

export async function serverSetup(options?: FastifyServerOptions) {
	const server = fastify(options).withTypeProvider<ZodTypeProvider>()

	server.setSerializerCompiler(serializerCompiler)
	server.setValidatorCompiler(validatorCompiler)

	server.register(fastifyCors, {
		origin: env.NODE_ENV === "production" ? env.ALLOWED_ORIGINS : "*",
		methods: ["GET", "POST"],
	})

	server.register(fastifySwagger, {
		openapi: {
			info: {
				title: "llink API reference",
				description: "API Reference of the Link shortener service llink",
				version: "0.1.0",
			},
			servers: [
				{
					url: env.BASE_URL,
					description: env.NODE_ENV,
				},
			],
		},
		transform: jsonSchemaTransform,
		transformObject: jsonSchemaTransformObject,
	})

	server.register(fastifyRateLimit, { global: false })

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

	server.register(shortcodeIdGeneratorPlugin, {
		rangeSize: 1_000,
		alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		maxSize: 3_521_614_606_208n,
		primeSalt: 1_982_736_451_239n,
	})

	server.register(rootRoutes)
	server.register(apiRoutes, { prefix: "/api/v1" })

	server.setErrorHandler((error: FastifyError, _req, reply) => {
		if (error instanceof ServerError) {
			server.log.warn(error)
			return reply.status(error.statusCode).send({
				error: {
					code: error.code,
					message: error.message,
				},
			})
		}

		if (error.validation) {
			return reply.status(400).send({
				error: {
					code: "VALIDATION_ERROR",
					message: error.message,
				},
			})
		}

		if (error.statusCode === 429) {
			return reply.status(429).send({
				error: {
					code: "RATE_LIMIT_EXCEEDED",
					message: "Too many requests",
				},
			})
		}

		server.log.error(error)
		return reply.status(500).send({
			error: {
				code: "INTERNAL_ERROR",
				message:
					env.NODE_ENV === "production"
						? "Internal server error"
						: error.message,
			},
		})
	})

	return server
}
