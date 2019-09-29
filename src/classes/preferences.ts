import { Document } from "mongoose";
import { InvalidParameterException, InvalidOperationException } from "@/classes/exceptions";

/**
 * Interface for timeslots on each day of the week
 */
interface TimeslotsDays {
	monday: number[],
	tuesday: number[],
	wednesday: number[],
	thursday: number[],
	friday: number[],
	saturday: number[],
	sunday: number[]
}

/**
 * Manages inspector availability preferences
 */
export class Availability {
	/**
	 * Gets the timeslot availabilities for an inspector
	 * @param inspector the inspector document
	 * @returns the timeslot availabilities for every day of the week
	 */
	public static getTimeslots(inspector: Document): TimeslotsDays {
		return {
			"monday": inspector.get("timeslots.monday"),
			"tuesday": inspector.get("timeslots.tuesday"),
			"wednesday": inspector.get("timeslots.wednesday"),
			"thursday": inspector.get("timeslots.thursday"),
			"friday": inspector.get("timeslots.friday"),
			"saturday": inspector.get("timeslots.saturday"),
			"sunday": inspector.get("timeslots.sunday")
		};
	}

	/**
	 * Adds a new timeslot availability for an inspector
	 * @param inspector the inspector document
	 * @param day the day of the week of the timeslot
	 * @param time the 24hr time of the timeslot
	 * @returns whether the add operation was successful
	 */
	public static addTimeslot(inspector: Document, day: string, time: number): boolean {
		if (
			day != "monday" &&
			day != "tuesday" &&
			day != "wednesday" &&
			day != "thursday" &&
			day != "friday" &&
			day != "saturday" &&
			day != "sunday"
		) {
			throw new InvalidParameterException("Invalid day of the week");
		}

		if (!(/^([0-9]|0[0-9]|1[0-9]|2[0-3])[0-5][0-9]$/.test("" + time))) {
			throw new InvalidParameterException("Invalid time");
		}

		let timeslots: number[] = inspector.get("timeslots." + day);
		if (timeslots.indexOf(time) != -1) {
			throw new InvalidOperationException("Duplicate timeslot");
		}

		timeslots.push(time);
		inspector.set("timeslots." + day, timeslots.sort((a, b) => a - b));
		inspector.save();
		return true;
	}

	/**
	 * Removes a new timeslot availability for an inspector
	 * @param inspector the inspector document
	 * @param day the day of the week of the timeslot
	 * @param time the 24hr time of the timeslot
	 * @returns whether the remove operation was successful
	 */
	public static removeTimeslot(inspector: Document, day: string, time: number): boolean {
		if (
			day != "monday" &&
			day != "tuesday" &&
			day != "wednesday" &&
			day != "thursday" &&
			day != "friday" &&
			day != "saturday" &&
			day != "sunday"
		) {
			throw new InvalidParameterException("Invalid day of the week");
		}

		if (!(/^([0-9]|0[0-9]|1[0-9]|2[0-3])[0-5][0-9]$/.test("" + time))) {
			throw new InvalidParameterException("Invalid time");
		}

		let timeslots: number[] = inspector.get("timeslots." + day);
		let index = timeslots.indexOf(time);
		if (index == -1) {
			throw new InvalidOperationException("Nonexistent timeslot");
		}

		timeslots.splice(index, 1);
		inspector.set("timeslots." + day, timeslots);
		inspector.save();
		return true;
	}
}
