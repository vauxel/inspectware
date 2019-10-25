import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectorSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: ShortId.generate
	},
	account: {
		type: String,
		ref: "Account"
	},
	email: String,
	password: String,
	first_name: String,
	last_name: String,
	phone: Number,
	timeslots: {
		monday: [Number],
		tuesday: [Number],
		wednesday: [Number],
		thursday: [Number],
		friday: [Number],
		saturday: [Number],
		sunday: [Number]
	},
	timeoff: [{
		date: String,
		time: Number
	}],
	inspections: [{
		type: String,
		ref: "Inspection"
	}],
});

export default Mongoose.model("Inspector", InspectorSchema);
