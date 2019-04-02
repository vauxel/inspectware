import { sign } from "jsonwebtoken";
import { hashSync, compareSync } from "bcrypt";
import { randomBytes } from "crypto";
import RuntimeException from "./exception";
import Account from "../models/account";
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
 * Exception thrown when registration fails possibly due to a conflict
 */
export class RegistrationException extends RuntimeException {
	public get getName(): string {
		return "RegistrationException";
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
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!user) {
			throw new InvalidLoginException("Invalid login credentials");
		}

		let validPassword = this.validatePassword(password, user.get("password"));

		if (user.get("email") != loginname || !validPassword) {
			throw new InvalidLoginException("Invalid login credentials");
		}

		const token = this.generateJWT({ userId: user.id });

		return {
			userId: user.id,
			name: user.get("name"),
			token
		};
	}

	/**
	 * Checks the sanitization of the given account registration information
	 * @param firstName 
	 * @param lastName 
	 * @param companyName 
	 * @param phoneNumber 
	 * @param emailAddress 
	 * @param password 
	 * @throws SanitizationException if any of the inputs is unsanitized
	 */
	public static checkAccountRegistrationInfoSanitization(firstName: string, lastName: string, companyName: string, phoneNumber: string, emailAddress: string, password: string): void {
		let nameRegex = /^[a-z\-\.\,\'\~\ ]+$/i;

		if (!firstName || !nameRegex.test(firstName)) {
			throw new SanitizationException("Please supply a valid, alphabetic first name");
		}

		if (!lastName || !nameRegex.test(lastName)) {
			throw new SanitizationException("Please supply a valid, alphabetic last name");
		}

		if (!companyName) {
			throw new SanitizationException("Please supply a valid company name");
		}

		let phoneRegex = /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

		if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
			throw new SanitizationException("Please supply a valid phone number");
		}

		let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (!emailAddress || !emailRegex.test(emailAddress)) {
			throw new SanitizationException("Please supply a valid email address");
		}

		if (!password) {
			throw new SanitizationException("Please supply a valid password");
		} else {
			if (password.length < 8) {
				throw new SanitizationException("Please supply a valid password (longer than 8 characters)");
			}

			if (!(/[a-z]/.test(password))) {
				throw new SanitizationException("Please supply a valid password (atleast 1 lowercase letter, 1 uppercase letter, and 1 number)");
			}

			if (!(/[A-Z]/.test(password))) {
				throw new SanitizationException("Please supply a valid password (atleast 1 lowercase letter, 1 uppercase letter, and 1 number)");
			}

			if (!(/[\d]/.test(password))) {
				throw new SanitizationException("Please supply a valid password (atleast 1 lowercase letter, 1 uppercase letter, and 1 number)");
			}
		}
	}

	/**
	 * Attempts to register an account and inspector with the given information
	 * @param firstName the first name of the inspector
	 * @param lastName the last name of the inspector
	 * @param companyName the name of the company
	 * @param phoneNumber the phone number of the inspector
	 * @param emailAddress the email address of the inspector
	 * @param password the plaintext password of the inspector
	 * @throws SanitizationException if the information is unsanitized
	 */
	public static async registerAccount(firstName: string, lastName: string, companyName: string, phoneNumber: string, emailAddress: string, password: string) {
		this.checkAccountRegistrationInfoSanitization(firstName, lastName, companyName, phoneNumber, emailAddress, password);

		const hashedPassword = this.hashPassword(password);

		let accountCount;
		let inspectorCount;

		try {
			accountCount = await Account.count({ name: companyName });
			inspectorCount = await Inspector.count({ email: emailAddress });
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (accountCount > 0) {
			throw new RegistrationException("A company by that name has already been registered");
		}

		if (inspectorCount > 0) {
			throw new RegistrationException("An inspector with that email address already exists");
		}

		const newAccount = new Account({
			name: companyName
		});
		
		const newInspector = new Inspector({
			email: emailAddress,
			password: hashedPassword,
			firstName: firstName,
			lastName: lastName,
			phone: phoneNumber.replace(/\D/g, ""),
			account: newAccount
		});

		try {
			newAccount.set("owner", newInspector);

			await newAccount.save();
			const inspector = await newInspector.save();

			await newAccount.updateOne({
				$push: { inspectors: newInspector }
			});
			await newAccount.save();

			const token = this.generateJWT({ userId: inspector.id });

			return {
				userId: inspector.id,
				token
			};
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}
	}
};
