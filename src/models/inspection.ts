import Mongoose from "mongoose";
import Util from "@classes/util";

const InspectionSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: () => Util.generateIdentifier()
	},
	inspection_number: Number,
	scheduled: {
		type: Number,
		default: Date.now
	},
	account: {
		type: String,
		ref: "Account"
	},
	date: String,
	time: Number,
	property: {
		address1: String,
		address2: String,
		city: String,
		state: String,
		zip: Number,
		sqft: Number,
		year_built: Number,
		foundation: String
	},
	services: [String],
	client1: {
		type: String,
		ref: "Client"
	},
	client2: {
		type: String,
		ref: "Client"
	},
	realtor: {
		type: String,
		ref: "Realtor"
	},
	inspector: {
		type: String,
		ref: "Inspector"
	},
	details_confirmed: {
		type: Boolean,
		default: false
	},
	agreement: {
		sent: {
			type: Boolean,
			default: false
		},
		signed: Boolean,
		timestamp: Number,
		ip: String,
		signature: String,
		doc: {
			type: String,
			ref: "IDocument"
		}
	},
	payment: {
		invoice_sent: {
			type: Boolean,
			default: false
		},
		doc: {
			type: String,
			ref: "IDocument"
		},
		invoiced: Number,
		balance: Number,
		payments: [{
			timestamp: Number,
			transaction: String,
			amount: Number,
			method: {
				type: String,
				enum: [
					"MANUAL",
					"STRIPE"
				],
			}
		}],
		details: {
			items: [{
				name: String,
				price: Number
			}],
			subtotal: Number,
			tax: Number,
			tax_percent: Number,
			total: Number
		}
	},
	report: {
		sent: Boolean,
		timestamp: Number,
		doc: {
			type: String,
			ref: "IDocument"
		}
	},
	status: {
		type: String,
		enum: [
			"PENDING_APPROVAL"
		],
		default: "PENDING_APPROVAL"
	}
});

export default Mongoose.model("Inspection", InspectionSchema);
