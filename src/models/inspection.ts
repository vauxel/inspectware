import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectionSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: ShortId.generate
	},
	inspectionNumber: {
		type: Number,
		required: [true, "An inspection number is required"]
	},
	scheduled: {
		type: Date,
		default: Date.now
	},
	date: {
		type: Date,
		required: [true, "A date is required"]
	},
	address: {
		type: String,
		required: [true, "An address is required"]
	},
	client: {
		type: String,
		ref: "Client"
	},
	realtor: {
		type: String,
		ref: "Realtor"
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
