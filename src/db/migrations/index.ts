import "dotenv/config"

import { join } from "node:path"
import { Client } from "cassandra-driver"
import fs from "fs/promises"
import { env } from "../../env.js"

const migrationsDir = join(process.cwd(), "src", "db", "migrations")

const files = (await fs.readdir(migrationsDir))
	.filter((file) => file.endsWith(".cql"))
	.sort()

const cassandraClient = new Client({
	contactPoints: env.CASSANDRA_CONTACT_POINTS,
	localDataCenter: env.CASSANDRA_DATACENTER,
})

await cassandraClient.connect()

for (const file of files) {
	const path = join(migrationsDir, file)

	const query = await fs.readFile(path, "utf-8")

	const statements = query
		.split(";")
		.map((line) => line.trim())
		.filter(Boolean)

	for (const statement of statements) {
		await cassandraClient.execute(statement)
	}

	console.log("Migration applied:", file)
}

await cassandraClient.shutdown()
