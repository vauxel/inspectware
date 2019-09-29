/**
 * Generic exception thrown during runtime
 */
export default class RuntimeException extends Error {
	/** The message of the exception */
	public message: string;
	/** The stack trace of the exception */
	public stack: any;

	/**
	 * Constructs the RuntimeException class with a message
	 * @param message the message to use
	 */
	constructor(message: string) {
		super(message);
		this.message = message;
		this.stack = (<any>new Error()).stack;
	}

	/**
	 * Gets the name of the exception
	 * @returns the exception's name
	 */
	public get getName(): string {
		return "RuntimeException";
	}

	/**
	 * Gets the message of the exception
	 * @returns the exception's message
	 */
	public get getMessage(): string {
		return this.message;
	}

	/**
	 * Gets the stack trace of the exception
	 * @returns the exception's stack trace
	 */
	public get getStackTrace(): string {
		return this.stack;
	}

	/**
	 * Gets the HTTP status code associated with the error
	 * @returns the exception's HTTP status code
	 */
	public get getHTTPStatus(): number {
		return 500;
	}

	/**
	 * Gets the stringification of the exception in the
	 * format: "name: message"
	 */
	toString(): string {
		return this.getName + ": " + this.message;
	}
};
