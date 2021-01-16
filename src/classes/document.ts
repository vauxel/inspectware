import RuntimeException from "@classes/exception";
import { InvalidParameterException, UnauthorizedException } from "@classes/exceptions";
import { Document } from "mongoose";
import moment from "moment";
import IDocumentModel from "@models/document";
import Util from "@classes/util";
import generalConf from "@root/conf/general.json";

/**
 * Manages inspector functionalities
 */
export class IDocument {
	/**
	 * Serves back the content for the given document
	 * @param idocument the inspection-document document
	 */
	public static async serveDocument(idocument: Document, variables?: object) {
		let content: any;

		if (idocument.get("content_type") == "FILE_RENDERED") {
			/* TO-DO: render a template file */
		} else if (idocument.get("content_type") == "FILE_STATIC") {
			/* TO-DO: load the file from a remote fileserver? */
		} else if (idocument.get("content_type") == "RENDERED") {
			/* TO-DO: render template text */
		} else if (idocument.get("content_type") == "RAW") {
			content = idocument.get("content");
		}

		return content;
	}

	/**
	 * Generates a unique token for document access
	 */
	private static generateToken(): string {
		return Util.generateIdentifier(generalConf.doc_token_generation.charset, generalConf.doc_token_generation.length);
	}

	/**
	 * Checks the authorization token against the inspection-document
	 * @param idocument the inspection-document document
	 * @param token the authorization token
	 */
	public static checkAuthorizationToken(idocument: Document, token: string) {
		let authorizations: any[] = idocument.get("authorizations");
		let found = authorizations.find(element => element.token == token);

		if (found === undefined) {
			throw new UnauthorizedException("Unauthorized to access this document");
		}

		if (found.duration !== -1) {
			let remove = false;

			if (found.duration === 0) { /* One-time use authorization */
				remove = true;
			} else {
				let daysDiff = moment(idocument.get("created")).diff(moment(), "days");
				if (daysDiff >= found.duration) {
					remove = true;
				}
			}

			if (remove) {
				/* TO-DO: add removal logic */
			}
		}
	}

	/**
	 * Logs an access to the inspection-document
	 * @param idocument the inspection-document document
	 * @param token the authorization token
	 * @param ip the user's ip address
	 */
	public static async logAuthorizationAccess(idocument: Document, token: string, ip: string) {
		let authorizations: any[] = idocument.get("authorizations");
		let foundIndex = authorizations.findIndex(element => element.token === token);

		if (foundIndex === -1) {
			return;
		}

		let timestamp = Date.now();
		let authorization = idocument.get(`authorizations[${foundIndex}]`);
		authorization.last_accessed = timestamp;
		authorization.last_ip = ip;

		if (!authorization.first_accessed) {
			authorization.first_accessed = timestamp;
			authorization.first_ip = ip;
		}

		idocument.set(`authorizations[${foundIndex}]`, authorization);
		await idocument.save();
	}

    /**
	 * Gets the inspections between a date range
	 * @param inspection the inspection document
	 * @returns the newly created document
	 */
    public static async generateInvoice(inspection: Document) {
		let authorizations = [];

		authorizations.push({
			userid: inspection.get("inspector"),
			usertype: "inspector",
			token: this.generateToken(),
			duration: -1
		});

		authorizations.push({
			userid: inspection.get("client1"),
			usertype: "client",
			token: this.generateToken(),
			duration: -1
		});

		if (inspection.get("client2")) {
			authorizations.push({
				userid: inspection.get("client2"),
				usertype: "client",
				token: this.generateToken(),
				duration: -1
			});
		}

		const newDoc = new IDocumentModel({
			inspection: inspection.id,
			doctype: "INVOICE",
			name: "Invoice",
			content_type: "RAW",
			content: "test invoice content",
			authorizations: authorizations
		});

		await newDoc.save();
		return newDoc;
    }
}
