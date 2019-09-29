import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectionSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: ShortId.generate
	},
	inspectionNumber: Number,
	scheduled: {
		type: Date,
		default: Date.now
	},
	date: Date,
	address: String,
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
