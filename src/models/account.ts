import Mongoose from "mongoose";
import Util from "@classes/util";
import DefaultData from "@classes/defaultdata";

const AccountSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: () => Util.generateIdentifier()
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
	logo: String,
	website_url: String,
	phone: String,
	email: String,
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
	},
	email_templates: {
		header: {
			type: String,
			default: () => DefaultData.getEmailHeader()
		},
		footer: {
			type: String,
			default: () => DefaultData.getEmailFooter()
		},
		scheduled_client: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailScheduledClientSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailScheduledClientBody()
			}
		},
		scheduled_realtor: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailScheduledRealtorSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailScheduledRealtorBody()
			}
		},
		notify_agreement: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailNotifyAgreementSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailNotifyAgreementBody()
			}
		},
		confirm_agreement: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailConfirmAgreementSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailConfirmAgreementBody()
			}
		},
		confirm_payment: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailConfirmPaymentSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailConfirmPaymentBody()
			}
		},
		report_client: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailReportClientSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailReportClientBody()
			}
		},
		report_realtor: {
			subject: {
				type: String,
				default: () => DefaultData.getEmailReportRealtorSubject()
			},
			body: {
				type: String,
				default: () => DefaultData.getEmailReportRealtorBody()
			}
		}
	}
});

export default Mongoose.model("Account", AccountSchema);
