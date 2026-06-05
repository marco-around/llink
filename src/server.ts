import "dotenv/config"

import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "@fastify/type-provider-zod"
import fastify from "fastify"
import { env } from "./env.js"
import { cassandraPlugin } from "./plugins/cassandra.js"

const server = fastify({
	logger: true,
}).withTypeProvider<ZodTypeProvider>()

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

server.register(cassandraPlugin, {
	cassandra: {
		contactPoints: env.CASSANDRA_CONTACT_POINTS,
		localDataCenter: env.CASSANDRA_DATACENTER,
	},
})

server.listen({ port: env.PORT, host: "0.0.0.0" }, () => {
	console.log("Server running")
})
