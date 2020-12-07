import { Document } from "mongoose";

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

		return {
			id: inspection.id,
			address: this.formatPropertyAddress(inspection.get("property")),
			client1: (inspection.get("client1") ? {
				name: `${inspection.get("client1.first_name")} ${inspection.get("client1.last_name")}`
			} : null),
			client2: (inspection.get("client2") ? {
				name: `${inspection.get("client2.first_name")} ${inspection.get("client2.last_name")}`
			} : null),
			realtor: (inspection.get("realtor") ? {
				name: `${inspection.get("realtor.first_name")} ${inspection.get("realtor.last_name")}`
			} : null),
			date: inspection.get("date"),
			time: inspection.get("time"),
			scheduled: inspection.get("scheduled")
		};
	}
}
