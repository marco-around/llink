import fastify from "fastify"

const PORT = 3000

const server = fastify({
	logger: true,
})

server.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`Server running in port ${PORT}`)
})
