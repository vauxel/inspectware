import { Document } from "mongoose";
import AccountModel from "@models/account";
import { Scheduler } from "@classes/scheduling";

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

		let parsedServices: string[] = [];

		for (let serviceName of inspection.get("services")) {
			if (serviceName == "full") {
				parsedServices.push("Full Home Inspection");
			} else if (serviceName == "pre") {
				parsedServices.push("Pre-Drywall Inspection");
			} else {
				parsedServices.push(AccountModel.findById(inspection.get("inspector").account).get("services").find((service: {short_name: string}) => service.short_name === serviceName));
			}
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
			services: parsedServices,
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
}
