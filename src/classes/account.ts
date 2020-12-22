import { InvalidParameterException, InvalidOperationException } from "@classes/exceptions";
import { Document } from "mongoose";
import moment from "moment";
import { Inspection } from "@classes/inspection";
import Templating from "@classes/templating";
import config from "@root/conf.json";

/**
 * Manages account functionalities
 */
export class Account {
    /**
	 * Gets the email templates for the account
	 * @param account the account document
	 * @returns the email templates as an array of objects
	 */
	public static getEmailTemplates(account: Document) {
		let templates = account.get("email_templates");
		let templatesData = [
			{
				id: "scheduled_client",
				name: "Inspection Scheduled (Client)",
				subject: templates.scheduled_client.subject,
				body: templates.scheduled_client.body
			},
			{
				id: "scheduled_realtor",
				name: "Inspection Scheduled (Realtor)",
				subject: templates.scheduled_realtor.subject,
				body: templates.scheduled_realtor.body
			},
			{
				id: "confirm_agreement",
				name: "Agreement Confirmation",
				subject: templates.confirm_agreement.subject,
				body: templates.confirm_agreement.body
			},
			{
				id: "confirm_payment",
				name: "Payment Confirmation",
				subject: templates.confirm_payment.subject,
				body: templates.confirm_payment.body
			},
			{
				id: "report_client",
				name: "Report Ready (Client)",
				subject: templates.report_client.subject,
				body: templates.report_client.body
			},
			{
				id: "report_realtor",
				name: "Report Ready (Realtor)",
				subject: templates.report_realtor.subject,
				body: templates.report_realtor.body
			}
		];
		
		return {
			header: templates.header,
			footer: templates.footer,
			templates: templatesData
		};
	}

	/**
	 * Updates a template subject and body
	 * @param account the account document
	 * @param template the template id
	 * @param body the new body
	 * @param subject the new subject (blank if header/footer)
	 */
	public static async updateEmailTemplate(account: Document, template: string, body: string, subject?: string) {
		if (!account.get("email_templates")[template]) {
			throw new InvalidParameterException("Invalid template name");
		}

		if ((template !== "header" && template !== "footer") && (!subject || subject.length === 0 || subject.length > config.validation.email.subject.max_length)) {
			throw new InvalidParameterException("Subject is either empty or too long");
		}

		if (!body || body.length === 0 || body.length > config.validation.email.body.max_length) {
			throw new InvalidParameterException("Body is either empty or too long");
		}

		body = Templating.sanitizeHtml(body);

		if (template !== "header" && template !== "footer") {
			subject = Templating.stripHtml(<string>subject);

			account.set(`email_templates.${template}.subject`, subject);
			account.set(`email_templates.${template}.body`, body);
		} else {
			account.set(`email_templates.${template}`, body);
		}

		await account.save();
		return true;
	}
}
