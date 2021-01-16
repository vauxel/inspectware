import RuntimeException from "@classes/exception";
import { InvalidParameterException, InvalidOperationException } from "@classes/exceptions";
import { existsSync, readFileSync } from "fs";
import { Document } from "mongoose";
import Nodemailer from "nodemailer";
import Juice from "juice";
import Mustache from "mustache";
import { Templating, LoginData, PaymentData } from "@classes/templating";
import InspectionModel from "@models/inspection";
import ClientModel from "@models/client";
import RealtorModel from "@models/realtor";
import InspectorModel from "@models/inspector";
import generalConf from "@root/conf/general.json";
import Mail from 'nodemailer/lib/mailer';
import realtor from '@models/realtor';

/**
 * Manages email functionalities
 */
export class Mailing {
	/** Nodemailer transporter for sending emails */
	private static transporter: Nodemailer.Transporter;

	/** Generic template for composing emails */
	private static genericTemplate: string;

	/**
	 * Instantiates the Nodemailer transporter
	 */
	public static instantiateTransporter(): void {
		if (this.transporter === undefined) {
			this.transporter = Nodemailer.createTransport({
				host: generalConf.email.host,
				port: generalConf.email.port,
				auth: {
					user: generalConf.email.auth.user,
					pass: generalConf.email.auth.pass
				}
			});
		}
	}

	/**
	 * Loads the generic email template
	 */
	public static loadGenericTemplate() {
		if (this.genericTemplate === undefined) {
			let path = generalConf.static_dir + "/" + generalConf.email.template;

			if (!existsSync(path)) {
				throw new InvalidParameterException("Generic email template file does not exist");
			}

			try {
				this.genericTemplate = readFileSync(path, "utf8");
			} catch (e) {
				throw new RuntimeException("Failed to retrieve generic email template file");
			}
		}
	}

	/**
	 * Sends an email with the provided details
	 * @param fromName the sender name
	 * @param fromAddr the sender email address
	 * @param toName the recipient name
	 * @param toAddr the recipient email address
	 * @param subject the subject of the email
	 * @param body the body of the email
	 */
	private static async send(fromName: string, fromAddr: string, toName: string, toAddr: string, subject: string, body: string) {
		let info: Nodemailer.SentMessageInfo = await this.transporter.sendMail({
			from: `"${fromName}" <${fromAddr}>`,
			to: `"${toName}" <${toAddr}>`,
			subject: subject,
			html: body
		});
		
		return info.messageId;
	}

	private static compose(header: string, body: string, footer: string) {
		let rendered = Mustache.render(this.genericTemplate, {
			header: header,
			body: body,
			footer: footer
		});
		let inlined = Juice(rendered);
		return inlined;
	}

	private static async sendTemplatedAccountEmail(account: Document, inspector: Document, body: string, subject: string, toName: string, toAddr: string) {
		let header = Templating.populateHeaderTemplate(
			account.get("email_templates").header,
			account,
			inspector
		);

		let footer = Templating.populateFooterTemplate(
			account.get("email_templates").footer,
			account,
			inspector
		);

		let composed = this.compose(header, body, footer);
		await this.send(
			account.get("name"),
			account.get("email"),
			toName,
			toAddr,
			subject,
			composed
		);
	}

	public static async sendScheduledClientEmail(account: Document, client: Document, inspector: Document, inspection: Document, login: LoginData) {
		let body = Templating.populateScheduledClientTemplate(
			account.get("email_templates").scheduled_client.body,
			client,
			inspector,
			inspection,
			login
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").scheduled_client.subject,
			client.get("first_name") + " " + client.get("last_name"),
			client.get("email")
		);
	}

	public static async sendScheduledRealtorEmail(account: Document, realtor: Document, inspector: Document, inspection: Document, login: LoginData) {
		let body = Templating.populateScheduledRealtorTemplate(
			account.get("email_templates").scheduled_realtor.body,
			realtor,
			inspector,
			inspection,
			login
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").scheduled_realtor.subject,
			realtor.get("first_name") + " " + realtor.get("last_name"),
			realtor.get("email")
		);
	}

	public static async sendAgreementNotificationEmail(account: Document, client: Document, inspector: Document, inspection: Document, doc: Document) {
		let body = Templating.populateNotifyAgreementTemplate(
			account.get("email_templates").notify_agreement.body,
			client,
			inspector,
			inspection,
			doc
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").notify_agreement.subject,
			client.get("first_name") + " " + client.get("last_name"),
			client.get("email")
		);
	}

	public static async sendAgreementConfirmationEmail(account: Document, client: Document, inspector: Document, inspection: Document) {
		let body = Templating.populateConfirmAgreementTemplate(
			account.get("email_templates").confirm_agreement.body,
			client,
			inspector,
			inspection
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").confirm_agreement.subject,
			client.get("first_name") + " " + client.get("last_name"),
			client.get("email")
		);
	}

	public static async sendPaymentConfirmationEmail(account: Document, client: Document, inspector: Document, inspection: Document, payment: PaymentData) {
		let body = Templating.populateConfirmPaymentTemplate(
			account.get("email_templates").confirm_payment.body,
			client,
			inspector,
			inspection,
			payment
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").confirm_payment.subject,
			client.get("first_name") + " " + client.get("last_name"),
			client.get("email")
		);
	}

	public static async sendReportReadyClientEmail(account: Document, client: Document, inspector: Document, inspection: Document, doc: Document) {
		let body = Templating.populateReportClientTemplate(
			account.get("email_templates").report_client.body,
			client,
			inspector,
			inspection,
			doc
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").report_client.subject,
			client.get("first_name") + " " + client.get("last_name"),
			client.get("email")
		);
	}

	public static async sendReportReadyRealtorEmail(account: Document, realtor: Document, inspector: Document, inspection: Document, doc: Document) {
		let body = Templating.populateReportRealtorTemplate(
			account.get("email_templates").report_realtor.body,
			realtor,
			inspector,
			inspection,
			doc
		);

		await this.sendTemplatedAccountEmail(
			account,
			inspector,
			body,
			account.get("email_templates").report_realtor.subject,
			realtor.get("first_name") + " " + realtor.get("last_name"),
			realtor.get("email")
		);
	}
};
