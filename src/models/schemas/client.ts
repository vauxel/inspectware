import { Schema } from 'mongoose';
import ShortId from "shortid";

import InspectionSchema from "./inspection";

const ClientSchema: Schema = new Schema({
	userId: {
		type: String,
		default: ShortId.generate
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
