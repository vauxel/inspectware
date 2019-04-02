import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectorSchema = new Mongoose.Schema({
	_id: {
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
	firstName: {
		type: String,
		required: [true, "A first name is required"]
	},
	lastName: {
		type: String,
		required: [true, "A last name is required"]
	},
	phone: {
		type: Number,
		required: [true, "A phone number is required"]
	},
	account: {
		type: String,
		ref: "Account"
	}
});

export default Mongoose.model("Inspector", InspectorSchema);
