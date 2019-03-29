const Schema = require('mongoose').Schema;
const shortid = require('shortid');

import InspectorSchema from "./inspector";
import ClientSchema from "./client";
import RealtorSchema from "./realtor";
import InspectionSchema from "./inspection";

const AccountSchema = new Schema({
	accountId: {
		type: String,
		default: shortid.generate
	},
	created: {
		type: Date,
		default: Date.now
	},
	owner: {
		type: InspectorSchema
	},
    inspectors: {
		type: [InspectorSchema]
	},
	clients: {
		type: [ClientSchema]
	},
	realtors: {
		type: [RealtorSchema]
	},
	inspections: {
		type: [InspectionSchema]
	},
	inspectionCounter: {
		type: Number,
		default: 0
	}
});

export default AccountSchema;
