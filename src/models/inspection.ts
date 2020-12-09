import Mongoose from "mongoose";
import Util from "@classes/util";

const InspectionSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: () => Util.generateIdentifier()
	},
	inspection_number: Number,
	scheduled: {
		type: Number,
		default: Date.now
	},
	date: String,
	time: Number,
	property: {
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: Number,
		sqft: Number,
		year_built: Number,
		foundation: String
	},
	services: [String],
	client1: {
		type: String,
		ref: "Client"
	},
	client2: {
		type: String,
		ref: "Client"
	},
	realtor: {
		type: String,
		ref: "Realtor"
	},
	inspector: {
		type: String,
		ref: "Inspector"
	},
	agreement: {
		sent: Boolean,
		signed: Boolean,
		timestamp: Number,
		ip: String,
		signature: String
	},
	payment: {
		invoiced: Number,
		balance: Number,
		timestamp: Number,
		transaction: String
	},
	report: {
		sent: Boolean,
		timestamp: Number
	},
	status: {
		type: String,
		enum: [
			"PENDING_APPROVAL"
		],
		default: "PENDING_APPROVAL"
	}
});

export default Mongoose.model("Inspection", InspectionSchema);
