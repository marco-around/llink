import { Client, type ClientOptions } from "cassandra-driver"
import fp from "fastify-plugin"

type CassandraPluginParams = {
	cassandra: ClientOptions
}

export const cassandraPlugin = fp<CassandraPluginParams>(
	async (fastify, options) => {
		const cassandraClient = new Client(options.cassandra)

		try {
			await cassandraClient.connect()
			fastify.log.info("Cassandra connected")
		} catch (error) {
			fastify.log.error(error, "Error when connect to cassandra")
			throw error
		}

		fastify.decorate("cassandra", cassandraClient)

		fastify.addHook("onClose", async () => {
			fastify.log.info("Closing Cassandra connection")

			await cassandraClient.shutdown()

			fastify.log.info("Cassandra connection closed")
		})
	},
	{
		name: "cassandra-plugin",
	}
)
