import { ServerError } from "./server-error.js"

export { ServerError }

export class ShortcodeNotFoundError extends ServerError {
	constructor(shortcode: string) {
		super(`Shortcode "${shortcode}" not found`, 404, "SHORTCODE_NOT_FOUND")
	}
}

export class ShortcodeGenerationError extends ServerError {
	constructor(cause?: Error) {
		super("Failed to generate shortcode", 503, "SHORTCODE_GENERATION_FAILED")
		this.cause = cause
	}
}

export class DatabaseError extends ServerError {
	constructor(operation: string, cause?: Error) {
		super(`Database operation failed: ${operation}`, 503, "DATABASE_ERROR")
		this.cause = cause
	}
}
