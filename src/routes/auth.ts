import { Router, Request, Response } from "express";
import Auth from "@/classes/auth";
import Util from "@/classes/util";
import { restrictAuthorization } from "@/routes/restrictions";

const AuthRouter = Router();

AuthRouter.post("/login", async (req: Request, res: Response) => {
	try {
		const data = await Auth.loginUser(req.body.affiliation, req.body.loginName, req.body.password);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

AuthRouter.post("/signup", async (req: Request, res: Response) => {
	console.log(req.body);
	try {
		const data = await Auth.registerAccount(
			req.body.first_name,
			req.body.last_name,
			req.body.company_name,
			req.body.phone_number,
			req.body.email_address,
			req.body.password
		);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

AuthRouter.post("/update_pass", restrictAuthorization, async (req: Request, res: Response) => {
	try {
		await Auth.updatePassword(res.locals.auth.affiliation, res.locals.auth.id, req.body.current, req.body.new);

		res.json({
			status: 200
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

AuthRouter.get("/user_info", restrictAuthorization, async (req: Request, res: Response) => {
	try {
		const data = await Auth.getUserInfo(res.locals.auth.affiliation, res.locals.auth.id);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default AuthRouter;
