import Mongoose from "mongoose";
import Util from "@classes/util";

const ClientSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: () => Util.generateIdentifier()
	},
	email: {
		type: String,
		required: [true, "A valid email is required"]
	},
	password: {
		type: String,
		required: [true, "A password is required"]
	},
	phone: {
		type: Number,
		required: [true, "A phone number is required"]
	},
	first_name: {
		type: String,
		required: [true, "A first name is required"]
	},
	last_name: {
		type: String,
		required: [true, "A last name is required"]
	},
	address: {
		street: String,
		city: String,
		state: String,
		zip: Number
	},
	inspections: [{
		type: String,
		ref: "Inspection"
	}]
});

export default Mongoose.model("Client", ClientSchema);
