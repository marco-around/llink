import type { FastifyRedis } from "@fastify/redis"

const RANGE_SIZE = 1_000

export function shortcodeIdGenerator(redis: FastifyRedis) {
	let current = 0
	let max = 0
	let allocationPromise: Promise<void> | null = null

	async function allocateNewIds() {
		try {
			const maxAllocated = await redis.incrby("SHORTCODE_ID", RANGE_SIZE)
			current = maxAllocated - RANGE_SIZE + 1
			max = maxAllocated
		} catch (error) {
			console.error("Failed to alocate new IDs", error)
			throw new Error()
		} finally {
			allocationPromise = null
		}
	}

	async function nextId() {
		if (current >= max || max === 0) {
			if (!allocationPromise) {
				allocationPromise = allocateNewIds()
			}
			await allocationPromise
		}
		return current++
	}

	return {
		allocateNewIds,
		nextId,
	}
}
