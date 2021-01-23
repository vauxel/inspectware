import { Router, Request, Response } from "express";
import { Account } from "@classes/account";
import { Templating } from "@classes/templating";
import { Mailing } from "@classes/mailing";
import { restrictAuthorization, restrictNonInspectors, restrictNonOwnerInspector } from "@routes/restrictions";
import Util from "@classes/util";

const AccountRouter = Router();

AccountRouter.get("/email_templates", restrictAuthorization, restrictNonOwnerInspector, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const account = await Util.resolveAccount(inspector.get("account"));
		const data = Account.getEmailTemplates(account);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

AccountRouter.post("/email_template", restrictAuthorization, restrictNonOwnerInspector, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const account = await Util.resolveAccount(inspector.get("account"));
		const success = await Account.updateEmailTemplate(
			account,
			req.body.template,
			req.body.body,
			req.body.subject
		);
		
		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

AccountRouter.get("/template_placeholders", restrictAuthorization, restrictNonOwnerInspector, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const account = await Util.resolveAccount(inspector.get("account"));
		const data = Templating.getTemplatePlaceholders(<string>req.query.template);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

AccountRouter.get("/services", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const account = await Util.resolveAccount(inspector.get("account"));
		const data = Account.getServices(account);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default AccountRouter;
