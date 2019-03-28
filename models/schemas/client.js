const Schema = require('mongoose').Schema;
const shortid = require('shortid');

import InspectionSchema from "./inspection";

const ClientSchema = new Schema({
	userId: {
		type: String,
		default: shortid.generate
	},
	email: {
		type: String,
		required: [true, "A valid email is required"]
	},
	password: {
		type: String,
		required: [true, "A password is required"]
	},
	name: {
		type: String,
		required: [true, "A name is required"]
	},
	inspections: {
		type: [InspectionSchema]
	}
});

export default ClientSchema;