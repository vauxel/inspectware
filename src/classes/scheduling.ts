import { InvalidParameterException, SanitizationException } from "@/classes/exceptions";
import { Document } from "mongoose";

/**
 * Manages inspection scheduling functionalities
 */
export class Scheduler {
	/**
	 * Gets the services for the specified account
	 * @param account the account document
	 */
	public static async getServices(account: Document) {
		if (!account) {
			throw new InvalidParameterException("An account by that id does not exist");
		}

		let services = [];

		for (let service of account.get("services")) {
			services.push({
				short: service.short_name,
				long: service.long_name
			});
		}

		return { services };
	}

	/**
	 * Gets the appointment availabilities between a date range
	 * @param account the account document
	 * @param start the starting timestamp
	 * @param end the ending timestamp
	 */
	public static async getAvailabilities(account: Document, start: number, end: number) {
		if (start <= 0 || !(new Date(start) instanceof Date)) {
			throw new InvalidParameterException("Invalid start timestamp");
		}

		if (end <= 0 || !(new Date(end) instanceof Date)) {
			throw new InvalidParameterException("Invalid end timestamp");
		}
	}

	/**
	 * Calculates a price given a tier structure and a value to test against
	 * @param tiering the tier structure
	 * @param value the value to test against
	 * @returns the calculated price
	 */
	private static calculateTieredPrice(tiering: [{floor: number, price: number}], value: number): number {
		let price = 0;

		for (let i = 0; i < tiering.length; i++) {
			if (value > tiering[i].floor) {
				price = tiering[i].price;
			}
		}

		return price;
	}
	
	/**
	 * Calculates the pricing table for an inspection with the given parameters
	 * @param account the account document
	 * @param services an array of service short names
	 * @param sqft the square footage of the house
	 * @param age the age of the house
	 * @param foundation the foundation type of the house
	 */
	public static async calculatePricing(account: Document, services: string[], sqft: number, age: number, foundation: string) {
		if (!services || services.length === 0) {
			throw new InvalidParameterException("Invalid services");
		}

		if (!sqft) {
			throw new InvalidParameterException("Invalid square footage");
		}

		if (!age) {
			throw new InvalidParameterException("Invalid house age");
		}

		if (!foundation || (foundation !== "basement" && foundation !== "slab" && foundation !== "crawlspace")) {
			throw new InvalidParameterException("Invalid foundation type");
		}

		let invoiceItems = [];
		let invoiceSubtotal = 0;
		let accountServices = account.get("services");

		for (let serviceName of services) {
			let service = accountServices.find((service: {short_name: string}) => service.short_name === serviceName);

			if (!service) {
				throw new InvalidParameterException("Invalid service name: " + serviceName);
			}

			invoiceItems.push({ name: service.long_name, price: service.price });
			invoiceSubtotal += service.price;
		}

		if ((services.includes("full") || services.includes("pre")) && account.get("sqft_pricing").enabled) {
			let price = this.calculateTieredPrice(account.get("sqft_pricing").ranges, sqft);

			invoiceItems.push({
				name: "Square Footage: " + sqft,
				price: price
			});

			invoiceSubtotal += price;
		}

		if (services.includes("full") && account.get("age_pricing").enabled) {
			let price = this.calculateTieredPrice(account.get("age_pricing").ranges, age);

			invoiceItems.push({
				name: "House Age: " + age,
				price: price
			});

			invoiceSubtotal += price;
		}

		let foundationPrice = account.get("foundation_pricing")[foundation];
		if (foundationPrice !== 0) {
			invoiceItems.push({
				name: "Foundation: " + foundation,
				price: foundationPrice
			});
			
			invoiceSubtotal += foundationPrice;
		}

		let invoiceTax = 0;
		let invoiceTaxPercent = account.get("tax");

		if (invoiceTaxPercent !== 0) {
			invoiceTax = parseFloat((invoiceSubtotal * invoiceTaxPercent).toFixed(2));
			invoiceTaxPercent = parseFloat((invoiceTaxPercent * 100).toFixed(3));
		}

		let invoiceTotal = invoiceSubtotal + invoiceTax;

		return {
			items: invoiceItems,
			subtotal: invoiceSubtotal,
			tax: invoiceTax,
			tax_percent: invoiceTaxPercent,
			total: invoiceTotal
		};
	}
}
