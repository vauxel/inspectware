import RuntimeException from "@classes/exception";
import { InvalidParameterException, SanitizationException, InvalidOperationException } from "@classes/exceptions";
import { Document } from "mongoose";
import moment from "moment";
import Mustache from "mustache";
// @ts-ignore
import sanitizeHtml from "sanitize-html";
import templatingConf from "@root/conf/templating.json";

export interface LoginData {
	link: string,
	username: string,
	password: string
}

export interface PaymentData {
	timestamp: number,
	amount: number,
	reference: string
}

/**
 * Manages templating functionalities
 */
export class Templating {
	/**
	 * Configures the templating engine
	 */
	public static configureEngine() {
		Mustache.escape = function(text) {
			return text;
		};
	}

	/**
	 * Sanitizes the given html string
	 * @param html the dirty html
	 * @returns the sanitized html
	 */
	public static sanitizeHtml(html: string) {
		return sanitizeHtml(html, {
			allowedTags: [
				"div",
				"span",
				"p",
				"strong",
				"em",
				"u",
				"s",
				"blockquote",
				"pre",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"ol",
				"li",
				"sub",
				"sup",
				"a",
				"iframe",
				"br",
				"hr"
			],
			selfClosing: [ "img", "br", "hr" ],
			allowedAttributes: {
				"a": [ "href", "rel", "target" ],
				"p": [ "class" ],
				"span": [ "class", "style" ],
				"pre": [ "class", "spellcheck" ],
				"iframe": [ "class", "allowFullscreen", "src", "frameborder" ]
			},
			allowedIframeHostnames: [ "www.youtube.com" ]
		});
	}

	/**
	 * Strips all html from the given text
	 * @param text the dirty text
	 * @returns the stripped text
	 */
	public static stripHtml(text: string) {
		return sanitizeHtml(text, {
			allowedTags: [],
			allowedAttributes: {}
		});
	}

	/**
	 * Gets the name mapping for the placeholder
	 * @param placeholder the placeholder
	 */
	private static mapTemplatePlaceholderName(placeholder: string) {
		if (!(templatingConf.placeholder_names as any)[placeholder]) {
			throw new InvalidParameterException("Invalid template placeholder");
		}

		return (templatingConf.placeholder_names as any)[placeholder];
	}

	/**
	 * Gets the grouping mapping for the placeholder
	 * @param placeholder the placeholder
	 */
	private static mapTemplatePlaceholderGrouping(placeholder: string) {
		let placeholderSplit = placeholder.split("_");
		let placeholderFirst = placeholderSplit[0];

		if (!placeholderFirst) {
			return "Miscellaneous";
		}

		return (templatingConf.placeholder_grouping as any)[placeholderFirst];
	}

	/**
	 * Gets the placeholders for the given template
	 * @param template the template name
	 */
	public static getTemplatePlaceholders(template: string) {
		let placeholders = (templatingConf.placeholders as any)[template];

		if (!placeholders) {
			throw new InvalidParameterException("Invalid template name");
		}

		let placeholdersParsed = [];
		let lastGrouping = "";

		for (let placeholder of placeholders) {
			let name = this.mapTemplatePlaceholderName(placeholder);
			let grouping = this.mapTemplatePlaceholderGrouping(placeholder);

			if (lastGrouping !== grouping) {
				lastGrouping = grouping;
				placeholdersParsed.push({
					grouping: grouping
				});
			}

			placeholdersParsed.push({
				placeholder: placeholder,
				name: name
			});
		}

		return placeholdersParsed;
	}

	/**
	 * Populates the given content with the given data, replacing placeholders
	 * @param content the content in which to populate
	 * @param data the data with which to populate
	 * @returns the data-populated content
	 */
	private static populateTemplate(content: string, data: any) {
		let rendered = Mustache.render(content, data);
		return rendered;
	}

	/**
	 * Extracts needed data from the input data
	 * @param placeholders the placeholders for which to extract data
	 * @param data the data from which to extract
	 * @returns the needed data for template population
	 */
	private static extractPlaceholderData(placeholders: string[], data: any) {
		let newData: any = {};

		for (let placeholder of placeholders) {
			let replacement = "";

			if (data.client) {
				if (placeholder === "CLIENT_NAME") {
					replacement = data.client.get("first_name") + " " + data.client.get("last_name");
				} else if (placeholder === "CLIENT_NAME_FIRST") {
					replacement = data.client.get("first_name");
				} else if (placeholder === "CLIENT_NAME_LAST") {
					replacement = data.client.get("last_name");
				}
			}

			if (data.realtor) {
				if (placeholder === "REALTOR_NAME") {
					replacement = data.realtor.get("first_name") + " " + data.realtor.get("last_name");
				} else if (placeholder === "REALTOR_NAME_FIRST") {
					replacement = data.realtor.get("first_name");
				} else if (placeholder === "REALTOR_NAME_LAST") {
					replacement = data.realtor.get("last_name");
				}
			}

			if (data.inspector) {
				if (placeholder === "INSPECTOR_NAME") {
					replacement = data.inspector.get("first_name") + " " + data.inspector.get("last_name");
				} else if (placeholder === "INSPECTOR_PHONE") {
					replacement = `<a href="tel:${data.inspector.get("phone")}">${data.inspector.get("phone")}</a>`;
				} else if (placeholder === "INSPECTOR_EMAIL") {
					replacement = `<a href="mailto:${data.inspector.get("email")}">${data.inspector.get("email")}</a>`;
				}
			}

			if (data.inspection) {
				if (placeholder === "PROPERTY_ADDRESS") {
					replacement = `${data.inspection.get("property").address1}${data.inspection.get("property").address2 ? " " + data.inspection.get("property").address2 : ""}, ${data.inspection.get("property").city}, ${data.inspection.get("property").state} ${data.inspection.get("property").zip}`;
				} else if (placeholder === "APPOINTMENT_TIME") {
					let hour = Math.floor(data.inspection.get("time") / 60);
					let minute = data.inspection.get("time") % 60;
					let period = hour < 12 || hour == 24 ? "AM" : "PM";
					hour = hour % 12 || 12;
					replacement = `${("" + hour).padStart(2, '0')}:${("" + minute).padStart(2, '0')} ${period}`;
				} else if (placeholder === "APPOINTMENT_DATE") {
					replacement = moment(data.inspection.get("date"), "YYYYMMDD", true).format("M/D/YYYY");
				} else if (placeholder === "SIGNED_DATE") {
					if (data.inspection.get("agreement").signed) {
						replacement = moment(data.inspection.get("agreement").timestamp).format("M/D/YYYY");
					}
				} else if (placeholder === "SIGNED_TIME") {
					if (data.inspection.get("agreement").signed) {
						replacement = moment(data.inspection.get("agreement").timestamp).format("h:mm A");
					}
				} else if (placeholder === "SIGNED_IP") {
					if (data.inspection.get("agreement").signed) {
						replacement = data.inspection.get("agreement").ip;
					}
				} else if (placeholder === "SIGNED_SIGNATURE") {
					if (data.inspection.get("agreement").signed) {
						replacement = "<img src='" + data.inspection.get("agreement").signature + "'/>";
					}
				}
			}

			if (data.doc) {
				if (placeholder === "AGREEMENT_LINK") {
					replacement = "TO-DO";
				} else if (placeholder === "REPORT_LINK") {
					replacement = "TO-DO";
				}
			}

			if (data.login) {
				if (placeholder === "LOGIN_LINK") {
					replacement = `<a href="${data.login.link}">${data.login.link}</a>`;
				} else if (placeholder === "LOGIN_USERNAME") {
					replacement = data.login.username;
				} else if (placeholder === "LOGIN_PASSWORD") {
					replacement = data.login.password;
				}
			}

			if (data.payment) {
				if (placeholder === "PAID_DATE") {
					replacement = moment(data.payment.timestamp).format("M/D/YYYY");
				} else if (placeholder === "PAID_TIME") {
					replacement = moment(data.payment.timestamp).format("h:mm A");
				} else if (placeholder === "PAID_AMOUNT") {
					replacement = data.payment.amount;
				} else if (placeholder === "PAID_REFERENCE") {
					replacement = data.payment.reference;
				}
			}

			if (data.account) {
				if (placeholder === "COMPANY_LOGO") {
					replacement = "<img src='" + data.account.get("logo") + "'/>";
				} else if (placeholder === "COMPANY_NAME") {
					replacement = data.account.get("name");
				} else if (placeholder === "COMPANY_WEBSITE") {
					replacement = `<a href="${data.account.get("website_url")}">${data.account.get("website_url")}</a>`;
				} else if (placeholder === "COMPANY_PHONE") {
					replacement = `<a href="tel:${data.account.get("phone")}">${data.account.get("phone")}</a>`;
				} else if (placeholder === "COMPANY_EMAIL") {
					replacement = `<a href="mailto:${data.account.get("email")}">${data.account.get("email")}</a>`;
				}
			}

			if (replacement !== "") {
				newData[placeholder] = replacement;
			}
		}

		return newData;
	}

	public static populateHeaderTemplate(content: string, account: Document, inspector: Document) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.header, {
			account,
			inspector
		});

		return this.populateTemplate(content, data);
	}

	public static populateFooterTemplate(content: string, account: Document, inspector: Document) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.footer, {
			account,
			inspector
		});

		return this.populateTemplate(content, data);
	}

	public static populateScheduledClientTemplate(content: string, client: Document, realtor: Document, inspector: Document, inspection: Document, login: LoginData) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.scheduled_client, {
			client,
			realtor,
			inspector,
			inspection,
			login
		});

		return this.populateTemplate(content, data);
	}

	public static populateScheduledRealtorTemplate(content: string, client: Document, realtor: Document, inspector: Document, inspection: Document, login: LoginData) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.scheduled_realtor, {
			client,
			realtor,
			inspector,
			inspection,
			login
		});

		return this.populateTemplate(content, data);
	}

	public static populateNotifyAgreementTemplate(content: string, client: Document, inspector: Document, inspection: Document, doc: Document) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.notify_agreement, {
			client,
			inspector,
			inspection,
			doc
		});

		return this.populateTemplate(content, data);
	}

	public static populateConfirmAgreementTemplate(content: string, client: Document, inspector: Document, inspection: Document) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.confirm_agreement, {
			client,
			inspector,
			inspection
		});

		return this.populateTemplate(content, data);
	}

	public static populateConfirmPaymentTemplate(content: string, client: Document, inspector: Document, inspection: Document, payment: PaymentData) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.confirm_payment, {
			client,
			inspector,
			inspection,
			payment
		});

		return this.populateTemplate(content, data);
	}

	public static populateReportClientTemplate(content: string, client: Document, inspector: Document, inspection: Document, doc: Document) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.report_client, {
			client,
			inspector,
			inspection,
			doc
		});

		return this.populateTemplate(content, data);
	}

	public static populateReportRealtorTemplate(content: string, realtor: Document, inspector: Document, inspection: Document, doc: Document) {
		let data = this.extractPlaceholderData(templatingConf.placeholders.report_realtor, {
			realtor,
			inspector,
			inspection,
			doc
		});

		return this.populateTemplate(content, data);
	}
};
