import Mongoose from "mongoose";
import ShortId from "shortid";

const AccountSchema = new Mongoose.Schema({
	accountId: {
		type: String,
		default: ShortId.generate
	},
	created: {
		type: Date,
		default: Date.now
	},
	owner: {
		type: { type: Number, ref: "Inspector" },
	},
    inspectors: {
		type: [{ type: Number, ref: "Inspector" }],
	},
	clients: {
		type: [{ type: Number, ref: "Client" }],
	},
	realtors: {
		type: [{ type: Number, ref: "Realtor" }],
	},
	inspections: {
		type: [{ type: Number, ref: "Inspection" }],
	},
	inspectionCounter: {
		type: Number,
		default: 0
	}
});

export default Mongoose.model("Account", AccountSchema);
