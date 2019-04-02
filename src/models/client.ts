import Mongoose from "mongoose";
import ShortId from "shortid";

const ClientSchema = new Mongoose.Schema({
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
	inspections: {
		type: String,
		ref: "Inspection"
	}
});

export default Mongoose.model("Client", ClientSchema);
