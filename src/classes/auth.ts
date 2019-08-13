import { sign } from "jsonwebtoken";
import { hashSync, compareSync } from "bcrypt";
import { randomBytes } from "crypto";
import ShortId from "shortid";
import RuntimeException from "./exception";
import { InvalidParametersException, SanitizationException } from "./exceptions";
import Account from "../models/account";
import Inspector from "../models/inspector";
import Client from "../models/client";
import Realtor from "../models/realtor";

/**
 * Exception thrown when tested login credentials are invalid
 */
class InvalidLoginException extends RuntimeException {
	public get getName(): string {
		return "InvalidLoginException";
	}
};

/**
 * Exception thrown when registration fails possibly due to a conflict
 */
class RegistrationException extends RuntimeException {
	public get getName(): string {
		return "RegistrationException";
	}
};

/**
 * Manages user authentication functionalities
 */
export default class Auth {
	/** Regex used for name sanitization */
	private static NAME_REGEX: RegExp = /^[a-z\-\.\,\'\~\ ]+$/i;
	/** Regex used for password sanitization */
	private static PASSWORD_REGEX: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
	/** Regex used for email address sanitization */
	private static EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	/** Regex used for phone number sanitization */
	private static PHONE_REGEX: RegExp = /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

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
	 * Gets the secret used for generating JWTs
	 * @returns the JWT secret
	 */
	public static getSecret(): string {
		return this.secret;
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
	 * Helper function to standardize the format of JWT payloads
	 * @param affiliation the affiliation (inspector / client / realtor) of a user
	 * @param id the id of a user
	 * @param loginName the login name (email / username) of a user
	 * @param name the full name of a user
	 * @param accountId the account id of the user if they are an inspector
	 */
	public static createJWTPayload(affiliation: string, id: string, loginName: string, name: string, accountId?: string): object {
		return {
			affiliation,
			id,
			loginName,
			name,
			accountId: accountId ? accountId : undefined
		};
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
	 * Gets a MongoDB model from an affiliation string
	 * @param affiliation the affiliation (inspector / client / realtor)
	 * @returns the MongoDB model associated with the affiliation string
	 */
	public static getModelFromAffiliation(affiliation: string) {
		if (affiliation === "inspector") {
			return Inspector;
		} else if (affiliation === "client") {
			return Client;
		} else if (affiliation === "realtor") {
			return Realtor;
		} else {
			throw new InvalidParametersException("Invalid affiliation");
		}
	}

	/**
	 * Checks the sanitization of the given login information
	 * @param loginName the login name (email / username)
	 * @param password the plaintext password
	 * @throws SanitizationException if any of the inputs is unsanitized
	 */
	public static checkLoginInfoSanitization(loginName: string, password: string): void {
		if (!loginName) {
			throw new SanitizationException("Please enter a login name");
		}

		if (!password) {
			throw new SanitizationException("Please enter a password");
		}
	}

	/**
	 * Attempts to login the user with the given credentials by giving them a generated authentication token
	 * @param affiliation the affiliation (inspector / client / realtor)
	 * @param loginName the login name (email / username)
	 * @param password the plaintext password
	 * @throws InvalidLoginException if the credentials are invalid
	 */
	public static async loginUser(affiliation: string, loginName: string, password: string) {
		try {
			this.checkLoginInfoSanitization(loginName, password);
		} catch (e) {
			throw new InvalidLoginException(e.getMessage);
		}

		const model = this.getModelFromAffiliation(affiliation);

		let user;
		try {
			user = await model.findOne({ email: loginName });
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!user) {
			throw new InvalidLoginException("Invalid login credentials");
		}

		const validPassword = this.validatePassword(password, user.get("password"));

		if (user.get("email") != loginName || !validPassword) {
			throw new InvalidLoginException("Invalid login credentials");
		}

		const token = this.generateJWT(this.createJWTPayload(
			affiliation,
			user.id,
			user.get("email"),
			user.get("first_name") + " " + user.get("last_name"),
			affiliation === "inspector" ? user.get("account") : undefined
		));

		return {
			userId: user.id,
			token
		};
	}

	/**
	 * Checks the sanitization of the given account registration information
	 * @param firstName the first name of the inspector
	 * @param lastName the last name of the inspector
	 * @param companyName the name of the company
	 * @param phoneNumber the phone number of the inspector
	 * @param emailAddress the email address of the inspector
	 * @param password the plaintext password of the inspector
	 * @throws SanitizationException if any of the inputs is unsanitized
	 */
	public static checkAccountRegistrationInfoSanitization(firstName: string, lastName: string, companyName: string, phoneNumber: string, emailAddress: string, password: string): void {
		if (!firstName || !this.NAME_REGEX.test(firstName)) {
			throw new SanitizationException("Please supply a valid, alphabetic first name");
		}

		if (!lastName || !this.NAME_REGEX.test(lastName)) {
			throw new SanitizationException("Please supply a valid, alphabetic last name");
		}

		if (!companyName) {
			throw new SanitizationException("Please supply a valid company name");
		}

		if (!phoneNumber || !this.PHONE_REGEX.test(phoneNumber)) {
			throw new SanitizationException("Please supply a valid phone number");
		}

		if (!emailAddress || !this.EMAIL_REGEX.test(emailAddress)) {
			throw new SanitizationException("Please supply a valid email address");
		}

		if (!password || !this.PASSWORD_REGEX.test(password)) {
			throw new SanitizationException("Please supply a valid password (atleast 8 characters, with atleast 1 lowercase letter, 1 uppercase letter, and 1 number)");
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
			first_name: firstName,
			last_name: lastName,
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

			const token = this.generateJWT(this.createJWTPayload(
				"inspector",
				newInspector.id,
				newInspector.get("email"),
				newInspector.get("first_name") + " " + newInspector.get("last_name"),
				newAccount.id
			));

			return {
				userId: inspector.id,
				token
			};
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}
	}

	/**
	 * Updates the password of a user
	 * @param affiliation the affiliation (inspector / client / realtor)
	 * @param userId the id of the user
	 * @param currentPass the current plaintext password
	 * @param newPass the new plaintext password
	 */
	public static async updatePassword(affiliation: string, userId: string, currentPass: string, newPass: string) {
		const model = this.getModelFromAffiliation(affiliation);

		if (!ShortId.isValid(userId)) {
			throw new InvalidParametersException("Invalid user id");
		}

		let user;
		try {
			user = await model.findOne({ _id: userId });
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!user) {
			throw new InvalidParametersException("Invalid user id");
		}

		if (!currentPass) {
			throw new InvalidParametersException("Invalid current password");
		}

		if (!this.validatePassword(currentPass, user.get("password"))) {
			throw new InvalidParametersException("Incorrect current password");
		}

		if (!newPass || !this.PASSWORD_REGEX.test(newPass)) {
			throw new SanitizationException("Please supply a valid new password (atleast 8 characters, with atleast 1 lowercase letter, 1 uppercase letter, and 1 number)");
		}

		user.set("password", this.hashPassword(newPass));
		await user.save();
	}

	/**
	 * Gets the basic info for a user
	 * @param affiliation the affiliation (inspector / client / realtor)
	 * @param userId the id of the user
	 */
	public static async getUserInfo(affiliation: string, userId: string) {
		const model = this.getModelFromAffiliation(affiliation);

		let user;
		try {
			user = await model.findOne({ _id: userId });
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!user) {
			throw new InvalidParametersException("Invalid user id");
		}

		return {
			firstName: user.get("first_name"),
			lastName: user.get("last_name"),
			email: user.get("email"),
			phone: user.get("phone"),
			account: user.get("account")
		};
	}
};
