import RuntimeException from "@/classes/exception"

/**
 * Exception thrown when the inputted data is unsanitized
 */
export class SanitizationException extends RuntimeException {
	public get getName(): string {
		return "SanitizationException";
	}

	public get getHTTPStatus(): number {
		return 400;
	}
};

/**
 * Exception thrown when a given parameter is invalid
 */
export class InvalidParameterException extends RuntimeException {
	public get getName(): string {
		return "InvalidParameterException";
	}

	public get getHTTPStatus(): number {
		return 400;
	}
};

/**
 * Exception thrown when the requested operation is invalid
 */
export class InvalidOperationException extends RuntimeException {
	public get getName(): string {
		return "InvalidOperationException";
	}

	public get getHTTPStatus(): number {
		return 409;
	}
};
