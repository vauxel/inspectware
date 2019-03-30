import Mongoose from "mongoose";
import ShortId from "shortid";

const InspectorSchema = new Mongoose.Schema({
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
	account: {
		type: { type: Number, ref: "Account" }
	}
});

export default Mongoose.model("Inspector", InspectorSchema);
