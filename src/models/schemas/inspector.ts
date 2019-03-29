const Schema = require('mongoose').Schema;
const shortid = require('shortid');

import AccountSchema from "./client";

const InspectorSchema = new Schema({
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
	account: {
		type: AccountSchema,
		required: [true, "A linked account is required"]
	}
});

export default InspectorSchema;
