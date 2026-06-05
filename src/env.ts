import z from "zod"

const DEFAULT_PORT = 3000

const envSchema = z.object({
	PORT: z.coerce.number().default(DEFAULT_PORT),
	CASSANDRA_CONTACT_POINTS: z.string().transform((value) => value.split(",")),
	CASSANDRA_DATACENTER: z.string(),
	CASSANDRA_KEYSPACE: z.string(),
})

export const env = envSchema.parse(process.env)
