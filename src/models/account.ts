import Mongoose from "mongoose";
import ShortId from "shortid";

const AccountSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: ShortId.generate
	},
	created: {
		type: Date,
		default: Date.now
	},
	name: {
		type: String,
		required: [true, "A company name is required"]
	},
	owner: {
		type: String,
		ref: "Inspector"
	},
	inspectors: [{
		type: String,
		ref: "Inspector"
	}],
	clients: [{
		type: String,
		ref: "Client"
	}],
	realtors: [{
		type: String,
		ref: "Realtor"
	}],
	inspections: [{
		type: String,
		ref: "Inspection"
	}],
	inspection_counter: {
		type: Number,
		default: 0
	},
	services: [{
		short_name: String,
		full_name: String,
		pricing_type: String,
		base_price: Number,
		ranges: [{
			step: Number,
			price: Number
		}],
		multiplier: Number
	}]
});

export default Mongoose.model("Account", AccountSchema);
