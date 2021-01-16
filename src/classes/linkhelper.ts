import RuntimeException from "@classes/exception";
import { Document } from "mongoose";
import Util from "@classes/util";
import generalConf from "@root/conf/general.json";

/**
 * Provides helping functionality for getting links
 */
export class LinkHelper {
    /**
     * Gets the login link for inspectors
     */
    public static get inspectorLoginLink() {
        return `${generalConf.public_base_url}/#inspector`;
    }

    /**
     * Gets the login link for clients
     */
    public static get clientLoginLink() {
        return `${generalConf.public_base_url}/#client`;
    }

    /**
     * Gets the login link for realtors
     */
    public static get realtorLoginLink() {
        return `${generalConf.public_base_url}/#realtor`;
    }
}
