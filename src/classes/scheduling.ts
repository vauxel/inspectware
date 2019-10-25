import { InvalidParameterException, InvalidOperationException } from "@/classes/exceptions";
import { Document } from "mongoose";
import moment from "moment";
import { Availability } from "@/classes/preferences";
import Auth from "@/classes/auth";
import Inspection from "@/models/inspection";
import Client from "@/models/client";
import Realtor from "@/models/realtor";
import Inspector from "@/models/inspector";

/**
 * Interface for scheduler property data
 */
interface PropertyData {
	address1: string,
	address2: string,
	city: string,
	state: string,
	zip: number,
	sqft: number,
	age: number,
	foundation: string
}

/**
 * Interface for scheduler appointment data
 */
interface AppointmentData {
	date: string,
	time: number,
	inspectorName: string,
	inspectorId: string
}

/**
 * Interface for scheduler client data
 */
interface ClientData {
	firstName: string,
	lastName: string,
	email: string,
	phone: string,
	address: string,
	city: string,
	state: string,
	zip: number
}

/**
 * Interface for scheduler realtor data
 */
interface RealtorData {
	firstName: string,
	lastName: string,
	affiliation: string,
	email: string,
	primaryPhone: string,
	primaryPhoneType: string,
	secondaryPhone: string,
	secondaryPhoneType: string,
	address: string,
	city: string,
	state: string,
	zip: number
}

/**
 * Manages inspection scheduling functionalities
 */
export class Scheduler {
	/**
	 * Gets the services for the specified account
	 * @param account the account document
	 * @returns an object array containing the short and long names of the services
	 */
	public static getServices(account: Document): {short: string, long: string}[] {
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

		return services;
	}

	/**
	 * Gets the appointment availabilities between a date range
	 * @param account the account document
	 * @param start the starting timestamp
	 * @param end the ending timestamp
	 */
	public static async getAvailabilities(account: Document, start: number, end: number) {
		let startMoment = moment(start, "YYYYMMDD", true);
		let endMoment = moment(end, "YYYYMMDD", true);

		if (!startMoment.isValid()) {
			throw new InvalidParameterException("Invalid start date");
		}

		if (!endMoment.isValid()) {
			throw new InvalidParameterException("Invalid end date");
		}

		let availabilities: {[k: string]: {time: number, inspectorId: string, inspectorName: string}[]} = {};

		await account.populate("inspectors").execPopulate();
		let inspectors: any[] = account.get("inspectors");

		let days = endMoment.diff(startMoment, "days") + 1;
		for (let i = 0; i < days; i++) {
			let dateMoment = moment(startMoment).add(i, "days");
			let dateString = dateMoment.format("YYYYMMDD");
			availabilities[dateString] = [];

			for (let inspector of inspectors) {
				let inspectorId: string = inspector._id;
				let inspectorName: string = inspector.first_name + " " + inspector.last_name;
				let weekday = dateMoment.format("dddd").toLowerCase();
				let timeoffs = Availability.getTimeoff(inspector);

				for (let timeslot of inspector.timeslots[weekday]) {
					let blockedoff = false;

					for (let timeoff of timeoffs) {
						if (timeoff.date == dateString && timeoff.time == timeslot) {
							blockedoff = true;
							break;
						}
					}

					if (!blockedoff) {
						availabilities[dateString].push({
							time: timeslot,
							inspectorId,
							inspectorName
						});
					}
				}
			}
		}

		return availabilities;
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

	/**
	 * Checks whether an inspector can be scheduled at the given timeslot
	 * @param account the account document
	 * @param inspectorId the id of the inspector
	 * @param date the timeslot date
	 * @param time the timeslot time
	 */
	private static async canScheduleInspector(account: Document, inspectorId: string, date: string, time: number) {
		await account.populate("inspectors").execPopulate();
		let inspectors: any[] = account.get("inspectors");
		let inspector = inspectors.find(({_id}) => _id == inspectorId);

		if (inspector === undefined) {
			throw new InvalidParameterException("Invalid inspector id");
		}
		
		let weekday = moment(date).format("dddd").toLowerCase();
		let timeoffs = Availability.getTimeoff(inspector);

		return inspector.timeslots[weekday].includes(time) && timeoffs.find(timeoff => timeoff.date == date && timeoff.time == time) === undefined;
	}

	/**
	 * Schedules an appointment
	 * @param account the account document
	 * @param services the services data
	 * @param property the property data
	 * @param appointment the appointment data
	 * @param client1 the first client data
	 * @param client2 the second client data
	 * @param realtor the realtor data
	 */
	public static async schedule(account: Document, services: string[], property: PropertyData, appointment: AppointmentData, client1: ClientData, client2: ClientData, realtor: RealtorData) {
		this.validateServicesData(account, services);
		this.validatePropertyData(property);
		await this.validateAppointmentData(account, appointment);

		let includeClient1Data = !!client1.email;
		let includeClient2Data = !!client2.email;
		let includeRealtorData = !!realtor.email;

		if (includeClient1Data) {
			this.validateClientData(client1);
		}

		if (includeClient2Data) {
			this.validateClientData(client2);
		}

		if (includeRealtorData) {
			this.validateRealtorData(realtor);
		}

		if (!includeClient1Data && !includeRealtorData) {
			throw new InvalidParameterException("Must provide either client or realtor data");
		}

		account.set("inspection_counter", account.get("inspection_counter") + 1);

		let createdClient1 = false;
		let client1Document: Document | null = null;
		if (includeClient1Data) {
			client1Document = await Client.findOne({ email: client1.email });

			if (!client1Document) {
				createdClient1 = true;
				client1Document = new Client({
					email: client1.email,
					password: Auth.generatePassword(8),
					phone: client1.phone.replace(/\D/g, ""),
					first_name: client1.firstName,
					last_name: client1.lastName,
					address: {
						street: client1.address,
						city: client1.city,
						state: client1.state,
						zip: client1.zip
					}
				});
			} else {
				client1Document.set("first_name", client1.firstName);
				client1Document.set("last_name", client1.lastName);
				client1Document.set("phone", client1.phone.replace(/\D/g, ""));
				client1Document.set("address.street", client1.address);
				client1Document.set("address.city", client1.city);
				client1Document.set("address.state", client1.state);
				client1Document.set("address.zip", client1.zip);
			}

			await client1Document.save();
		}

		let createdClient2 = false;
		let client2Document: Document | null = null;
		if (includeClient2Data) {
			client2Document = await Client.findOne({ email: client2.email });

			if (!client2Document) {
				createdClient2 = true;
				client2Document = new Client({
					email: client2.email,
					password: Auth.generatePassword(8),
					phone: client2.phone.replace(/\D/g, ""),
					first_name: client2.firstName,
					last_name: client2.lastName,
					address: {
						street: client2.address,
						city: client2.city,
						state: client2.state,
						zip: client2.zip
					}
				});
			} else {
				client2Document.set("first_name", client2.firstName);
				client2Document.set("last_name", client2.lastName);
				client2Document.set("phone", client2.phone.replace(/\D/g, ""));
				client2Document.set("address.street", client2.address);
				client2Document.set("address.city", client2.city);
				client2Document.set("address.state", client2.state);
				client2Document.set("address.zip", client2.zip);
			}

			await client2Document.save();
		}

		let createdRealtor = false;
		let realtorDocument: Document | null = await Realtor.findOne({ email: realtor.email });
		if (includeRealtorData) {
			if (!realtorDocument) {
				createdRealtor = true;
				realtorDocument = new Realtor({
					email: realtor.email,
					password: Auth.generatePassword(8),
					phone_primary: {
						phone_type: realtor.primaryPhoneType,
						number: realtor.primaryPhone.replace(/\D/g, "")
					},
					phone_secondary: {
						phone_type: realtor.secondaryPhoneType,
						number: realtor.secondaryPhone.replace(/\D/g, "")
					},
					first_name: realtor.firstName,
					last_name: realtor.lastName,
					affiliation: realtor.affiliation,
					address: {
						street: realtor.address,
						city: realtor.city,
						state: realtor.state,
						zip: realtor.zip
					}
				});
			} else {
				realtorDocument.set("phone_primary.phone_type", realtor.primaryPhoneType);
				realtorDocument.set("phone_primary.number", realtor.primaryPhone.replace(/\D/g, ""));
				realtorDocument.set("phone_secondary.phone_type", realtor.secondaryPhoneType);
				realtorDocument.set("phone_secondary.number", realtor.secondaryPhone.replace(/\D/g, ""));
				realtorDocument.set("first_name", realtor.firstName);
				realtorDocument.set("last_name", realtor.lastName);
				realtorDocument.set("affiliation", realtor.affiliation);
				realtorDocument.set("address.street", realtor.address);
				realtorDocument.set("address.city", realtor.city);
				realtorDocument.set("address.state", realtor.state);
				realtorDocument.set("address.zip", realtor.zip);
			}
	
			await realtorDocument.save();
		}

		let inspector = await Inspector.findOne({ _id: appointment.inspectorId });

		if (!inspector) {
			throw new InvalidParameterException("Invalid inspector id");
		}

		const inspection = new Inspection({
			inspection_number: account.get("inspection_counter"),
			date: moment(appointment.date, "YYYYMMDD").toDate(),
			property: {
				address1: property.address1,
				address2: property.address2,
				city: property.city,
				state: property.state,
				zip: property.zip,
				sqft: property.sqft,
				age: property.age,
				foundation: property.foundation
			},
			client1: client1Document,
			client2: client2Document,
			realtor: realtorDocument,
			inspector: inspector
		});

		await inspection.save();

		if (realtorDocument) {
			await realtorDocument.updateOne({
				$push: { inspections: inspection }
			});

			if (client1Document) {
				await realtorDocument.updateOne({
					$push: { clients: client1Document }
				});
			}

			if (client2Document) {
				await realtorDocument.updateOne({
					$push: { clients: client2Document }
				});
			}
		}

		if (client1Document) {
			await client1Document.updateOne({
				$push: { inspections: inspection }
			});
		}

		if (client2Document) {
			await client2Document.updateOne({
				$push: { inspections: inspection }
			});
		}

		await inspector.updateOne({
			$push: { inspections: inspection }
		});

		// TODO: Send emails to realtor and clients
	}

	private static validateServicesData(account: Document, services: string[]) {
		if (services.length == 0) {
			throw new InvalidParameterException("No services");
		}

		if (services.includes("full") && services.includes("pre")) {
			throw new InvalidParameterException("Cannot schedule both a full and pre inspection");
		}

		for (let serviceName of services) {
			let service = account.get("services").find((service: {short_name: string}) => service.short_name === serviceName);

			if (!service) {
				throw new InvalidParameterException("Invalid service name: " + serviceName);
			}
		}
	}

	private static validatePropertyData(property: PropertyData) {
		if (!property.address1 || property.address1.length === 0) {
			throw new InvalidParameterException("Invalid property address 1");
		}

		if (!property.city || property.city.length === 0 || !(/^[a-zA-Z',.\s-]{1,25}$/.test(property.city))) {
			throw new InvalidParameterException("Invalid property city");
		}

		if (!property.state || property.state.length === 0 || !(/^[A-Z]{2}$/.test(property.state))) {
			throw new InvalidParameterException("Invalid property state");
		}

		if (!property.zip || !(/^\d{5}$/.test("" + property.zip))) {
			throw new InvalidParameterException("Invalid property zip");
		}

		if (!property.sqft || property.sqft <= 0 || property.sqft > 999999) {
			throw new InvalidParameterException("Invalid property sqft");
		}

		if (!property.age || property.age < 0 || property.age > 999) {
			throw new InvalidParameterException("Invalid property age");
		}

		if ((!property.foundation || property.foundation.length === 0) || (property.foundation !== "slab" && property.foundation !== "crawlspace" && property.foundation !== "basement")) {
			throw new InvalidParameterException("Invalid property foundation type");
		}
	}

	private static async validateAppointmentData(account: Document, appointment: AppointmentData) {
		let date = moment(appointment.date, "YYYYMMDD", true);

		if (!date.isValid()) {
			throw new InvalidParameterException("Invalid appointment date");
		}

		if (appointment.time < 0 || appointment.time >= 1440 || Math.floor(appointment.time) != appointment.time) {
			throw new InvalidParameterException("Invalid appointment time");
		} else {
			let hour = Math.floor(appointment.time / 60);
			let minute = appointment.time % 60;

			if (hour < 0 || hour >= 24 || minute < 0 || minute >= 60) {
				throw new InvalidParameterException("Invalid appointment time");
			}
		}

		let inspectors: string[] = account.get("inspectors");
		if (!inspectors.includes(appointment.inspectorId)) {
			throw new InvalidParameterException("Invalid appointment inspector");
		}

		if (!(await this.canScheduleInspector(account, appointment.inspectorId, appointment.date, appointment.time))) {
			throw new InvalidParameterException("Inspector is unavailable at specified timeslot");
		}
	}

	private static validateClientData(client: ClientData) {
		if ((!client.firstName || client.firstName.length === 0) || !(/^[a-z\-\.\,\'\~\ ]+$/i.test(client.firstName))) {
			throw new InvalidParameterException("Invalid client first name");
		}

		if ((!client.lastName || client.lastName.length === 0) || !(/^[a-z\-\.\,\'\~\ ]+$/i.test(client.lastName))) {
			throw new InvalidParameterException("Invalid client last name");
		}

		if ((!client.email || client.email.length === 0) || !(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(client.email))) {
			throw new InvalidParameterException("Invalid client email");
		}

		if ((!client.phone || client.phone.length === 0) || !(/^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(client.phone))) {
			throw new InvalidParameterException("Invalid client phone");
		}

		let checkAddress = !!client.address || !!client.city || !!client.state || !!client.zip;
		
		/*if (!!client.address && !(/^[a-zA-Z',.;:\s-#]$/.test(client.address))) {
			throw new InvalidParameterException("Invalid client address");
		}*/

		if (checkAddress && (!client.address || client.address.length === 0)) {
			throw new InvalidParameterException("Invalid client address");
		}

		if (checkAddress && !(/^[a-zA-Z',.\s-]{1,25}$/.test(client.city))) {
			throw new InvalidParameterException("Invalid client city");
		}

		if (checkAddress && !(/^[A-Z]{2}$/.test(client.state))) {
			throw new InvalidParameterException("Invalid client state");
		}

		if (checkAddress && !(/^\d{5}$/.test("" + client.zip))) {
			throw new InvalidParameterException("Invalid client zip");
		}
	}

	private static validateRealtorData(realtor: RealtorData) {
		if (!realtor.firstName || realtor.firstName.length === 0 || !(/^[a-z\-\.\,\'\~\ ]+$/i.test(realtor.firstName))) {
			throw new InvalidParameterException("Invalid realtor first name");
		}

		if (!realtor.lastName || realtor.lastName.length === 0 || !(/^[a-z\-\.\,\'\~\ ]+$/i.test(realtor.lastName))) {
			throw new InvalidParameterException("Invalid realtor last name");
		}

		// Affiliation checking skipped

		if (!realtor.email || realtor.email.length === 0 || !(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(realtor.email))) {
			throw new InvalidParameterException("Invalid realtor email");
		}

		if (!realtor.primaryPhone || realtor.primaryPhone.length === 0 || !(/^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(realtor.primaryPhone))) {
			throw new InvalidParameterException("Invalid realtor primary phone");
		}

		if (!realtor.primaryPhoneType || realtor.primaryPhoneType.length === 0 || (realtor.primaryPhoneType !== "cell" && realtor.primaryPhoneType !== "work" && realtor.primaryPhoneType !== "other")) {
			throw new InvalidParameterException("Invalid realtor primary phone type");
		}

		if (!realtor.primaryPhone || realtor.primaryPhone.length === 0 || !(/^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(realtor.primaryPhone))) {
			throw new InvalidParameterException("Invalid realtor primary phone");
		}

		if (!realtor.primaryPhoneType || realtor.primaryPhoneType.length === 0 || (realtor.primaryPhoneType !== "cell" && realtor.primaryPhoneType !== "work" && realtor.primaryPhoneType !== "other")) {
			throw new InvalidParameterException("Invalid realtor primary phone type");
		}

		if (!!realtor.secondaryPhone && !(/^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(realtor.secondaryPhone))) {
			throw new InvalidParameterException("Invalid realtor secondary phone");
		}

		if ((!!realtor.secondaryPhone || !!realtor.secondaryPhoneType) && (realtor.secondaryPhoneType !== "cell" && realtor.secondaryPhoneType !== "work" && realtor.secondaryPhoneType !== "other")) {
			throw new InvalidParameterException("Invalid realtor secondary phone type");
		}

		let checkAddress = !!realtor.address || !!realtor.city || !!realtor.state || !!realtor.zip;

		/*if (!!realtor.address && !(/^[a-zA-Z',.;:\s-#]$/.test(realtor.address))) {
			throw new InvalidParameterException("Invalid realtor address");
		}*/

		if (checkAddress && (!realtor.address || realtor.address.length === 0)) {
			throw new InvalidParameterException("Invalid realtor address");
		}

		if (checkAddress && !(/^[a-zA-Z',.\s-]{1,25}$/.test(realtor.city))) {
			throw new InvalidParameterException("Invalid realtor city");
		}

		if (checkAddress && !(/^[A-Z]{2}$/.test(realtor.state))) {
			throw new InvalidParameterException("Invalid realtor state");
		}

		if (checkAddress && !(/^\d{5}$/.test("" + realtor.zip))) {
			throw new InvalidParameterException("Invalid realtor zip");
		}
	}
}
