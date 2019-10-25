import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectionSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: ShortId.generate
	},
	inspection_number: Number,
	scheduled: {
		type: Date,
		default: Date.now
	},
	date: Date,
	property: {
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: Number,
		sqft: Number,
		age: Number,
		foundation: String
	},
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
	status: {
		type: String,
		enum: [
			"PENDING_APPROVAL"
		],
		default: "PENDING_APPROVAL"
	}
});

export default Mongoose.model("Inspection", InspectionSchema);
