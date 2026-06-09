import z from "zod"

const DEFAULT_PORT = 3000
const DEFAULT_HOST = "0.0.0.0"
const DEFAULT_LOG_LEVEL = "debug"
const DEFAULT_NODE_ENV = "development"

const envSchema = z.object({
	BASE_URL: z.url(),
	PORT: z.coerce.number().default(DEFAULT_PORT),
	HOST: z.string().default(DEFAULT_HOST),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default(DEFAULT_LOG_LEVEL),
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default(DEFAULT_NODE_ENV),
	CASSANDRA_CONTACT_POINTS: z.string().transform((value) => value.split(",")),
	CASSANDRA_DATACENTER: z.string(),
	CASSANDRA_KEYSPACE: z.string(),
	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number(),
})

export const env = envSchema.parse(process.env)
