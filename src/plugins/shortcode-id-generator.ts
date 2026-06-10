import fp from "fastify-plugin"
import { ShortcodeGenerationError } from "../errors/index.js"

const SHORTCODE_LENGTH = 7

type ShortcodeIdGeneratorPluginParams = {
	rangeSize: number
	primeSalt: bigint
	alphabet: string
	maxSize: bigint
}

export const shortcodeIdGeneratorPlugin = fp<ShortcodeIdGeneratorPluginParams>(
	async (fastify, options) => {
		let current = 0
		let max = 0
		let allocationPromise: Promise<void> | null = null

		async function allocateNewIds() {
			try {
				const maxAllocated = await fastify.redis.incrby(
					"SHORTCODE_ID",
					options.rangeSize
				)
				current = maxAllocated - options.rangeSize + 1
				max = maxAllocated
			} catch (error) {
				throw new ShortcodeGenerationError(
					error instanceof Error ? error : undefined
				)
			} finally {
				allocationPromise = null
			}
		}

		async function nextShortcode() {
			if (current >= max || max === 0) {
				if (!allocationPromise) {
					allocationPromise = allocateNewIds()
				}
				await allocationPromise
			}
			const scrambledNumber =
				(BigInt(current++) * options.primeSalt) % options.maxSize

			let shortCode = ""

			if (scrambledNumber === 0n) {
				shortCode = options.alphabet[0]
			} else {
				let currentNumber = scrambledNumber

				while (currentNumber > 0n) {
					const index = Number(currentNumber % 62n)
					shortCode = options.alphabet[index] + shortCode
					currentNumber = currentNumber / 62n
				}
			}

			return shortCode.padStart(SHORTCODE_LENGTH, options.alphabet[0])
		}

		fastify.decorate("shortcodeIdGenerator", { nextShortcode })
	},
	{ name: "shortcode-id-generator-plugin", dependencies: ["@fastify/redis"] }
)
