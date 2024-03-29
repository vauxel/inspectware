import { InvalidParameterException, InvalidOperationException } from "@classes/exceptions";
import { Document } from "mongoose";
import AccountModel from "@models/account";
import IDocumentModel from "@models/document";
import { Scheduler } from "@classes/scheduling";
import { IDocument } from "@classes/document";
import RuntimeException from './exception';

/**
 * Manages inspection functionalities
 */
export class Inspection {
	/**
	 * Formats the property address info as a proper string
	 * @param property the property info
	 * @returns the property address info as a formatted string
	 */
	public static formatPropertyAddress(property: {
		address1: string,
		address2: string,
		city: string,
		state: string,
		zip: number,
	}) {
		return `${property.address1}${property.address2 ? " " + property.address2 : ""}, ${property.city}, ${property.state} ${property.zip}`;
	}

	/**
	 * Gets information about an inspection
	 * @param inspection the inspection document
	 */
	public static async getInfo(inspection: Document) {
		await inspection.populate("client1 client2 realtor inspector").execPopulate();
		let account = await AccountModel.findById(inspection.get("account"));

		if (account === null) {
			throw new RuntimeException("Inspection document is malformed");
		}

		return {
			id: inspection.id,
			property: {
				address1: inspection.get("property").address1,
				address2: inspection.get("property").address2,
				city: inspection.get("property").city,
				state: inspection.get("property").state,
				zip: inspection.get("property").zip,
				sqft: inspection.get("property").sqft,
				year_built: inspection.get("property").year_built,
				foundation: inspection.get("property").foundation
			},
			services: inspection.get("services"),
			inspector: {
				id: inspection.get("inspector").id,
				name: `${inspection.get("inspector.first_name")} ${inspection.get("inspector.last_name")}`,
				phone: inspection.get("inspector.phone"),
				email: inspection.get("inspector.email")
			},
			client1: (inspection.get("client1") ? {
				id: inspection.get("client1").id,
				name: `${inspection.get("client1.first_name")} ${inspection.get("client1.last_name")}`,
				phone: inspection.get("client1.phone"),
				email: inspection.get("client1.email")
			} : null),
			client2: (inspection.get("client2") ? {
				id: inspection.get("client2").id,
				name: `${inspection.get("client2.first_name")} ${inspection.get("client2.last_name")}`,
				phone: inspection.get("client2.phone"),
				email: inspection.get("client2.email")
			} : null),
			realtor: (inspection.get("realtor") ? {
				id: inspection.get("realtor").id,
				name: `${inspection.get("realtor.first_name")} ${inspection.get("realtor.last_name")}`,
				phone: inspection.get("realtor.phone"),
				email: inspection.get("realtor.email")
			} : null),
			date: inspection.get("date"),
			time: inspection.get("time"),
			scheduled: inspection.get("scheduled"),
			details_confirmed: inspection.get("details_confirmed")
		};
	}

	/**
	 * Updates property details for an inspection
	 * @param inspection the inspection document
	 * @param address1 the primary address
	 * @param address2 the optional secondary address
	 * @param city the city
	 * @param state the state
	 * @param zip the zip code
	 * @param sqft the square footage of the house
	 * @param year_built the built year of the house
	 * @param foundation the foundation type of the house
	 * @returns whether the add operation was successful
	 */
	public static async updatePropertyDetails(inspection: Document, address1: string, address2: string, city: string, state: string, zip: number, sqft: number, year_built: number, foundation: string) {
		if (inspection.get("details_confirmed") === true) {
			throw new InvalidOperationException("The inspection details are already confirmed");
		}

		Scheduler.validatePropertyData({
			address1: !!address1 ? address1 : inspection.get("property").address1,
			address2,
			city: !!city ? city : inspection.get("property").city,
			state: !!state ? state : inspection.get("property").state,
			zip: !!zip ? zip : inspection.get("property").zip,
			sqft: !!sqft ? sqft : inspection.get("property").sqft,
			year_built: !!year_built ? year_built : inspection.get("property").year_built,
			foundation: !!foundation ? foundation : inspection.get("property").foundation
		});

		let property = inspection.get("property");

		if (!!address1) {
			property.address1 = address1;
		}

		property.address2 = address2;

		if (!!city) {
			property.city = city;
		}

		if (!!state) {
			property.state = state;
		}

		if (!!zip) {
			property.zip = zip;
		}

		if (!!sqft) {
			property.sqft = sqft;
		}

		if (!!year_built) {
			property.year_built = year_built;
		}

		if (!!foundation) {
			property.foundation = foundation;
		}

		inspection.set("property", property);
		await inspection.save();
		return true;
	}

	/**
	 * Updates the appointment date and time for an inspection
	 * @param inspection the inspection document
	 * @param date the new date
	 * @param time the new time
	 * @returns whether the add operation was successful
	 */
	public static async updateAppointment(inspection: Document, date: string, time: number) {
		if (inspection.get("details_confirmed") === true) {
			throw new InvalidOperationException("The inspection details are already confirmed");
		}

		Scheduler.validateDatetimeData(date, time);
		inspection.set("date", date);
		inspection.set("time", time);
		await inspection.save();
		return true;
	}

	/**
	 * Updates the services for an inspection
	 * @param inspection the inspection document
	 * @param main the new main service
	 * @param additional the new list of additional services
	 */
	public static async updateServices(inspection: Document, main: string, additional: string[]) {
		console.log(additional);
		if (inspection.get("details_confirmed") === true) {
			throw new InvalidOperationException("The inspection details are already confirmed");
		}

		let account = await AccountModel.findById(inspection.get("account"));

		if (account === null) {
			throw new RuntimeException("Inspection document is malformed");
		}

		Scheduler.validateServicesData(account, [...additional, main]);

		inspection.set("services.main", main);
		inspection.set("services.additional", additional);
		await inspection.save();
		return true;
	}

	/**
	 * Gets pricing & payment information for an inspection
	 * @param inspection the inspection document
	 */
	public static async getPaymentInfo(inspection: Document) {
		let account = await AccountModel.findById(inspection.get("account"));

		if (account === null) {
			throw new RuntimeException("Inspection document is malformed");
		}

		let pricing = !inspection.get("payment").invoice_sent ? Scheduler.calculatePricing(
			account,
			[...inspection.get("services").additional, inspection.get("services").main],
			inspection.get("property").sqft,
			inspection.get("property").year_built,
			inspection.get("property").foundation
		) : {
			items: inspection.get("payment").details.items,
			subtotal: inspection.get("payment").details.subtotal,
			tax: inspection.get("payment").details.tax,
			tax_percent: inspection.get("payment").details.tax_percent,
			total: inspection.get("payment").details.total
		};

		return {
			invoice_sent: inspection.get("payment").invoice_sent,
			invoiced: inspection.get("payment").invoiced,
			balance: inspection.get("payment").balance,
			payments: inspection.get("payment").payments,
			details: pricing
		}
	}

	/**
	 * Confirms the inspection details
	 * @param inspection the inspection document
	 */
	public static async confirmDetails(inspection: Document) {
		if (inspection.get("details_confirmed") === true) {
			throw new InvalidOperationException("The inspection details are already confirmed");
		}

		inspection.set("details_confirmed", true);
		await inspection.save();
		return true;
	}

	/**
	 * Generates and sends a payment invoice to the client(s)
	 * @param inspection the inspection document
	 */
	public static async generateSendInvoice(inspection: Document) {
		if (inspection.get("payment").invoice_sent === true) {
			throw new InvalidOperationException("Invoice has already been sent");
		}

		let account = await AccountModel.findById(inspection.get("account"));

		if (account === null) {
			throw new RuntimeException("Inspection document is malformed");
		}

		let idocument = await IDocument.generateInvoice(inspection);

		/* TO-DO: send email */

		let pricing = Scheduler.calculatePricing(
			account,
			[...inspection.get("services").additional, inspection.get("services").main],
			inspection.get("property").sqft,
			inspection.get("property").year_built,
			inspection.get("property").foundation
		);

		inspection.set("payment.invoice_sent", true);
		inspection.set("payment.doc", idocument.id);
		inspection.set("payment.invoiced", pricing.total);
		inspection.set("payment.balance", pricing.total);
		inspection.set("payment.details.items", pricing.items);
		inspection.set("payment.details.subtotal", pricing.subtotal);
		inspection.set("payment.details.tax", pricing.tax);
		inspection.set("payment.details.tax_percent", pricing.tax_percent);
		inspection.set("payment.details.total", pricing.total);
		await inspection.save();

		return await this.getPaymentInfo(inspection);
	}

	/**
	 * Retrieves all the documents associated with the inspection
	 * @param inspection the inspection document
	 */
	public static async getDocuments(inspection: Document, requester: Document) {
		let idocuments = await IDocumentModel.find({ inspection: inspection.id }).exec();
		let data = [];
		
		for (let idocument of idocuments) {
			if (idocument.get("doctype") === "REPORT") {
				continue;
			}

			let authorization = idocument.get("authorizations").find((auth: any) => auth.userid === requester.id);

			if (authorization === undefined) {
				continue;
			}

			data.push({
				id: idocument.id,
				doctype: idocument.get("doctype"),
				name: idocument.get("name"),
				created: idocument.get("created"),
				token: authorization.token
			});
		}

		return data;
	}
}
