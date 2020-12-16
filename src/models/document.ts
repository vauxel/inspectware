import Mongoose from "mongoose";
import Util from "@classes/util";

const IDocumentSchema = new Mongoose.Schema({
	_id: {
		type: String,
		default: () => Util.generateIdentifier()
	},
	created: {
		type: Number,
		default: Date.now
	},
	inspection: {
		type: String,
		ref: "Inspection"
	},
	doctype: {
		type: String,
		enum: [
			"INVOICE",
			"AGREEMENT",
			"REPORT",
			"OTHER"
		]
	},
	name: String,
	content_type: {
		type: String,
		enum: [
			"FILE_RENDERED",
			"FILE_STATIC",
			"RENDERED",
			"RAW"
		]
	},
	content: String,
	authorizations: [{
		userid: String,
		usertype: String,
		token: String,
		duration: Number,
		first_accessed: Number,
		last_accessed: Number,
		first_ip: String,
		last_ip: String
	}]
});

export default Mongoose.model("IDocument", IDocumentSchema);
