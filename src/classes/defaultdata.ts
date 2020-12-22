import { existsSync, readFileSync } from "fs";
import RuntimeException from "@classes/exception";
import { InvalidParameterException } from "@classes/exceptions";
import config from "@root/conf.json";

/**
 * Manages retrieving default data
 */
export default class DefaultData {
    public static read(filename: string) {
        let path = config.defaultdata_dir + "/" + filename + ".dat";

        if (!existsSync(path)) {
            throw new InvalidParameterException("Default data file does not exist");
        }

        let data;

        try {
            data = readFileSync(path);
        } catch (e) {
            throw new RuntimeException("Failed to retrieve default data file");
        }

        return data;
    }

    public static getEmailHeader() {
        return this.read("email_header");
    }

    public static getEmailFooter() {
        return this.read("email_footer");
    }

    public static getEmailScheduledClientSubject() {
        return this.read("email_scheduled_client_subject");
    }

    public static getEmailScheduledClientBody() {
        return this.read("email_scheduled_client_body");
    }

    public static getEmailScheduledRealtorSubject() {
        return this.read("email_scheduled_realtor_subject");
    }

    public static getEmailScheduledRealtorBody() {
        return this.read("email_scheduled_realtor_body");
    }

    public static getEmailConfirmAgreementSubject() {
        return this.read("email_confirm_agreement_subject");
    }

    public static getEmailConfirmAgreementBody() {
        return this.read("email_confirm_agreement_body");
    }

    public static getEmailConfirmPaymentSubject() {
        return this.read("email_confirm_payment_subject");
    }

    public static getEmailConfirmPaymentBody() {
        return this.read("email_confirm_payment_body");
    }

    public static getEmailReportClientSubject() {
        return this.read("email_report_client_subject");
    }

    public static getEmailReportClientBody() {
        return this.read("email_report_client_body");
    }

    public static getEmailReportRealtorSubject() {
        return this.read("email_report_realtor_subject");
    }

    public static getEmailReportRealtorBody() {
        return this.read("email_report_realtor_body");
    }
};
