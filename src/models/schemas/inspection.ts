const Schema = require('mongoose').Schema;
const shortid = require('shortid');

import ClientSchema from "./client";
import RealtorSchema from "./realtor";

const InspectionSchema = new Schema({
	inspectionId: {
		type: String,
		default: shortid.generate
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
		type: ClientSchema,
		default: undefined
	},
	realtor: {
		type: RealtorSchema,
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

export default InspectionSchema;
