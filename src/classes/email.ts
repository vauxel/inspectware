import RuntimeException from "@classes/exception";
import { InvalidParameterException, SanitizationException, InvalidOperationException } from "@classes/exceptions";
import Nodemailer from "nodemailer";
import config from "@root/conf.json";

/**
 * Manages email functionalities
 */
export default class Email {
	/** Nodemailer transporter for sending emails */
	private static transporter: Nodemailer.Transporter;

	/**
	 * Instantiates the Nodemailer transporter
	 */
	public static instantiateTransporter(): void {
		if (this.transporter === undefined) {
			this.transporter = Nodemailer.createTransport({
				host: config.email.host,
				port: config.email.port,
				secure: config.email.secure,
				auth: {
					user: config.email.auth.user,
					pass: config.email.auth.pass
				}
			})
		}
	}

	/**
	 * Sends an email with the provided details
	 * @param fromName the sender name
	 * @param fromAddr the sender email address
	 * @param to array of destination email addresses
	 * @param subject the subject of the email
	 * @param body the body of the email
	 */
	private static async sendEmail(fromName: string, fromAddr: string, to: [string], subject: string, body: string) {
		let info: Nodemailer.SentMessageInfo = await this.transporter.sendMail({
			from: `"${fromName}" <${fromAddr}>`,
			to: to.join(", "),
			subject: subject,
			html: body
		});
		
		return info.messageId;
	}
};
