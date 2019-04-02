import Mongoose from "mongoose";
import ShortId from "shortid";

const RealtorSchema = new Mongoose.Schema({
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
	name: {
		type: String,
		required: [true, "A name is required"]
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
