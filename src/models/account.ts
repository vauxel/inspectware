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
	tax: {
		type: Number,
		default: 0.0
	},
	age_pricing: {
		enabled: {
			type: Boolean,
			default: true
		},
		pricing_type: {
			type: String,
			default: "tiered"
		},
		ranges: {
			type: [{
				floor: Number,
				price: Number
			}],
			default: [
				{
					floor: 10,
					price: 25
				},
				{
					floor: 20,
					price: 50
				},
				{
					floor: 30,
					price: 75
				}
			]
		},
		multiplier: {
			type: Number,
			default: 1
		}
	},
	sqft_pricing: {
		enabled: {
			type: Boolean,
			default: true
		},
		pricing_type: {
			type: String,
			default: "tiered"
		},
		ranges: {
			type: [{
				floor: Number,
				price: Number
			}],
			default: [
				{
					floor: 1000,
					price: 50
				},
				{
					floor: 2000,
					price: 100
				},
				{
					floor: 3000,
					price: 150
				}
			]
		},
		multiplier: {
			type: Number,
			default: 1
		}
	},
	foundation_pricing: {
		type: {
			basement: Number,
			slab: Number,
			crawlspace: Number
		},
		default: {
			basement: 0,
			slab: 0,
			crawlspace: 0
		}
	},
	services: {
		type: [{
			short_name: String,
			long_name: String,
			price: Number
		}],
		default: [
			{
				short_name: "radon",
				long_name: "Radon Inspection",
				price: 100
			},
			{
				short_name: "termite",
				long_name: "Termite Inspection",
				price: 100
			}
		]
	}
});

export default Mongoose.model("Account", AccountSchema);
