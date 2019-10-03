import { Response } from "express";
import RuntimeException from "@/classes/exception";
import { InvalidParameterException } from "@/classes/exceptions";
import Account from "@/models/account";
import Inspector from "@/models/inspector";
import Client from "@/models/client";
import Realtor from "@/models/realtor";

/**
 * Utility class for common functions
 */
export default class Util {
	/**
	 * Resolves an account id to an account document
	 * @param accountId the account id
	 */
	public static async resolveAccount(accountId: string) {
		let account;
		try {
			account = await Account.findById(accountId);
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!account) {
			throw new InvalidParameterException("An account by that id does not exist");
		}

		return account;
	}

	/**
	 * Resolves an inspector id to an inspector document
	 * @param inspectorId the inspector id
	 */
	public static async resolveInspector(inspectorId: string) {
		let inspector;
		try {
			inspector = await Inspector.findById(inspectorId);
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!inspector) {
			throw new InvalidParameterException("An inspector by that id does not exist");
		}

		return inspector;
	}

	/**
	 * Resolves a client id to a client document
	 * @param clientId the client id
	 */
	public static async resolveClient(clientId: string) {
		let client;
		try {
			client = await Client.findById(clientId);
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!client) {
			throw new InvalidParameterException("A client by that id does not exist");
		}

		return client;
	}

	/**
	 * Resolves a realtor id to a realtor document
	 * @param realtorId the realtor id
	 */
	public static async resolveRealtor(realtorId: string) {
		let realtor;
		try {
			realtor = await Realtor.findById(realtorId);
		} catch (e) {
			throw new RuntimeException("Database error: " + e.message);
		}

		if (!realtor) {
			throw new InvalidParameterException("A realtor by that id does not exist");
		}

		return realtor;
	}

	/**
	 * Handles an error and responses to it accordingly
	 * @param e the error object
	 * @param res the express response object
	 */
	public static handleError(e: Error, res: Response) {
		let status = e instanceof RuntimeException ? e.getHTTPStatus : 500;
		let message = e instanceof RuntimeException ? e.getMessage : e.message;
		res.status(status).json({ status, message });
	}
};
