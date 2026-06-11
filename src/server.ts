import { env } from "./env.js"
import { serverSetup } from "./setup.js"
import { shutdownServer } from "./utils/shutdown-server.js"

const server = await serverSetup({
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
})

process.on("SIGINT", shutdownServer)
process.on("SIGTERM", shutdownServer)

try {
	await server.listen({ port: env.PORT, host: env.HOST })
	server.log.info(`API Reference available at ${env.BASE_URL}/reference`)
} catch (error) {
	server.log.error(error)
	process.exit(1)
}
