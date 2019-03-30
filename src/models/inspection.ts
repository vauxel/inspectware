import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectionSchema = new Mongoose.Schema({
	inspectionId: {
		type: String,
		default: ShortId.generate
	},
	inspectionNumber: {
		type: Number,
		required: [true, "An inspection number is required"]
	},
	address: {
		type: String,
		required: [true, "An address is required"]
	},
	client: {
		type: { type: Number, ref: "Client" },
		default: undefined
	},
	realtor: {
		type: { type: Number, ref: "Realtor" },
		default: undefined
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
