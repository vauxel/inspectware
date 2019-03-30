import Mongoose from "mongoose";
import ShortId from "shortid";

const ClientSchema = new Mongoose.Schema({
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
		type: { type: Number, ref: "Inspection" },
	}
});

export default Mongoose.model("Client", ClientSchema);
