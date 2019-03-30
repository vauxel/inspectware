import { sign } from "jsonwebtoken";
import { hashSync, compareSync } from "bcrypt";
import { randomBytes } from "crypto";
import RuntimeException from "./exception";
import Inspector from "../models/inspector";
import Client from "../models/client";
import Realtor from "../models/realtor";

/**
 * Exception thrown when tested login credentials are invalid
 */
export class InvalidLoginException extends RuntimeException {
	public get getName(): string {
		return "InvalidLoginException";
	}
};

/**
 * Exception thrown when the given credentials are unsanitized
 */
export class SanitizationException extends RuntimeException {
	public get getName(): string {
		return "SanitizationException";
	}
};

/**
 * Manages user authentication functionalities
 */
export class Auth {
	/** Secret used for generating JWTs */
	private static secret: string;

	/**
	 * Generates and stores a secret used for generating JWTs, but can only be called once per runtime
	 */
	public static generateSecret(): void {
		if(!this.secret) {
			this.secret = randomBytes(64).toString("hex");
		}
	}

	/**
	 * Generates a JSON Web Token (JWT) from the inputs
	 * @param payload the payload data
	 * @returns the generated JWT
	 */
	public static generateJWT(payload: any): string {
		return sign(payload, this.secret, { expiresIn: "24h" });
	}

	/**
	 * Hashes the given plaintext password
	 * @param password the plaintext password
	 * @returns the hashed password
	 */
	public static hashPassword(password: string): string {
		return hashSync(password, 10);
	}

	/**
	 * Validates a given plaintext password against another hashed password
	 * @param password the plaintext password
	 * @param hash the hashed password
	 * @returns whether the two passwords are equivalent
	 */
	public static validatePassword(password: string, hash: string): boolean {
		return compareSync(password, hash);
	}

	/**
	 * Checks the sanitization of the given login information
	 * @param loginname the login name (email / username)
	 * @param password the plaintext password
	 * @throws SanitizationException if any of the inputs is unsanitized
	 */
	public static checkLoginInfoSanitization(loginname: string, password: string): void {
		if (!loginname) {
			throw new SanitizationException("Please enter a login name");
		}

		if (!password) {
			throw new SanitizationException("Please enter a password");
		}
	}

	/**
	 * Attempts to login the user with the given credentials by giving them a generated authentication token
	 * @param affiliation the affiliation (inspector / client / realtor)
	 * @param loginname the login name (email / username)
	 * @param password the plaintext password
	 * @throws InvalidLoginException if the credentials are invalid
	 */
	public static async loginUser(affiliation: string, loginname: string, password: string) {
		try {
			this.checkLoginInfoSanitization(loginname, password);
		} catch (e) {
			throw new InvalidLoginException(e.getMessage);
		}

		let model;
		switch (affiliation) {
			case "inspector":
				model = Inspector;
				break;
			case "client":
				model = Client;
				break;
			case "realtor":
				model = Realtor;
				break;
			default:
				throw new InvalidLoginException("Invalid affiliation");
		}

		let user;

		try {
			user = await model.findOne({ email: loginname });
		} catch {
			throw new RuntimeException("Database error");
		}

		if (!user) {
			throw new InvalidLoginException("Invalid login credentials");
		}

		let validPassword = this.validatePassword(password, user.get("password"));

		if (user.get("email") != loginname || !validPassword) {
			throw new InvalidLoginException("Invalid login credentials");
		}

		const token = this.generateJWT({ userId: user.get("userId") });

		return {
			userId: user.get("userId"),
			name: user.get("name"),
			token
		};
	}

	public static checkUserRegistrationInfoSanitization(loginname: string, password: string): void {
		if (!loginname) {
			throw new SanitizationException("Please supply a login name");
		}

		if (!password) {
			throw new SanitizationException("Please supply a password");
		}
	}

	/**
	 * Attempts to register a user with the given information
	 * @param affiliation the affiliation (inspector / client / realtor)
	 * @param loginname the login name (email / username)
	 * @param password the plaintext password
	 * @param name the name of the user
	 * @throws SanitizationException if the information is unsanitized
	 */
	public static async registerUser(affiliation: string, loginname: string, password: string, name: string) {
		this.checkUserRegistrationInfoSanitization(loginname, password);

		let model;
		switch (affiliation) {
			case "inspector":
				model = Inspector;
				break;
			case "client":
				model = Client;
				break;
			case "realtor":
				model = Realtor;
				break;
			default:
				throw new SanitizationException("Invalid affiliation");
		}

		const hashedPassword = this.hashPassword(password);

		const newUser = new model({
			email: loginname,
			password: hashedPassword,
			name
		});

		try {
			const user = await newUser.save();
			const token = this.generateJWT({ userId: user.get("userId") });

			return {
				userId: user.get("userId"),
				token
			};
		} catch {
			throw new RuntimeException("Database error");
		}
	}
};
