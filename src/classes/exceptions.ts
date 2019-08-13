import RuntimeException from "./exception"

/**
 * Exception thrown when the inputted data is unsanitized
 */
export class SanitizationException extends RuntimeException {
	public get getName(): string {
		return "SanitizationException";
	}
};

/**
 * Exception thrown when given parameters are invalid
 */
export class InvalidParametersException extends RuntimeException {
	public get getName(): string {
		return "InvalidParametersException";
	}
};
