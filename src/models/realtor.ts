import Mongoose from "mongoose";
import Util from "@classes/util";

const RealtorSchema = new Mongoose.Schema({
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
	phone_primary: {
		phone_type: String,
		number: Number
	},
	phone_secondary: {
		phone_type: String,
		number: Number
	},
	first_name: {
		type: String,
		required: [true, "A first name is required"]
	},
	last_name: {
		type: String,
		required: [true, "A last name is required"]
	},
	affiliation: String,
	address: {
		street: String,
		city: String,
		state: String,
		zip: Number
	},
	inspections: [{
		type: String,
		ref: "Inspection"
	}],
	clients: [{
		type: String,
		ref: "Client"
	}]
});

export default Mongoose.model("Realtor", RealtorSchema);
