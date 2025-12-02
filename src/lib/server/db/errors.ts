export class DbError extends Error {
	originalError: unknown;
	code?: string;

	constructor(message: string, { originalError, code }: { originalError: unknown; code?: string }) {
		super(message);
		this.originalError = originalError;
		this.code = code;
	}
}
