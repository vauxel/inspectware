import moment from "moment";
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
	 * @param time the 24hr time of the timeslot in minutes since midnight
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

		if (time < 0 || time >= 1440 || Math.floor(time) != time) {
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
	 * @param time the 24hr time of the timeslot in minutes since midnight
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

		if (time < 0 || time >= 1440 || Math.floor(time) != time) {
			throw new InvalidParameterException("Invalid time");
		}

		let timeslots: number[] = inspector.get("timeslots." + day);
		let index: number = timeslots.indexOf(time);
		if (index == -1) {
			throw new InvalidOperationException("Nonexistent timeslot");
		}

		timeslots.splice(index, 1);
		inspector.set("timeslots." + day, timeslots);
		inspector.save();
		return true;
	}

	/**
	 * Gets the time-off slots for an inspector for the next 30 days
	 * @param inspector the inspector document
	 * @returns the inspector's time-off slots over the next 30 days
	 */
	public static getTimeoff(inspector: Document): {date: string, time: number}[] {
		const timeoff: {date: string, time: number}[] = inspector.get("timeoff");
		return timeoff;
	}

	/**
	 * Adds a time-off slot for an inspector
	 * @param inspector the inspector document
	 * @param date the date in ISO format (year-month-day)
	 * @param time the 24hr time in minutes since midnight
	 * @returns whether the add operation was successful
	 */
	public static addTimeoff(inspector: Document, date: string, time: number): boolean {
		let dateMoment: moment.Moment = moment(date, "YYYYMMDD");

		if (!dateMoment.isValid()) {
			throw new InvalidParameterException("Invalid date");
		}

		if (time < 0 || time >= 1440 || Math.floor(time) != time) {
			throw new InvalidParameterException("Invalid time");
		}

		let timeoff: {date: string, time: number}[] = inspector.get("timeoff");
		if (timeoff.find((timeoff => timeoff.date == date && timeoff.time == time)) != undefined) {
			throw new InvalidOperationException("Duplicate time-off slot");
		}

		timeoff.push({ date, time });
		inspector.set("timeoff", timeoff);
		inspector.save();
		return true;
	}

	/**
	 * Removes a time-off slot for an inspector
	 * @param inspector the inspector document
	 * @param date the date in ISO format (year-month-day)
	 * @param time the 24hr time in minutes since midnight
	 * @returns whether the remove operation was successful
	 */
	public static removeTimeoff(inspector: Document, date: string, time: number): boolean {
		let dateMoment: moment.Moment = moment(date, "YYYYMMDD");

		if (!dateMoment.isValid()) {
			throw new InvalidParameterException("Invalid date");
		}

		if (time < 0 || time >= 1440 || Math.floor(time) != time) {
			throw new InvalidParameterException("Invalid time");
		}

		let timeoff: {date: string, time: number}[] = inspector.get("timeoff");
		let index = timeoff.findIndex((timeoff => timeoff.date == date && timeoff.time == time));
		if (index == -1) {
			throw new InvalidOperationException("Nonexistent time-off slot");
		}

		timeoff.splice(index, 1);
		inspector.set("timeoff", timeoff);
		inspector.save();
		return true;
	}
}
