import Mongoose from "mongoose";
import ShortId from "shortid";

const RealtorSchema = new Mongoose.Schema({
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
		type: [{ type: Number, ref: "Inspection" }],
	},
	clients: {
		type: [{ type: Number, ref: "Client" }],
	}
});

export default Mongoose.model("Realtor", RealtorSchema);
