import { Router, Request, Response } from "express";
import { Auth } from "../classes/auth";
import { checkAuthorization } from "./checks";

const AuthRouter = Router();

AuthRouter.post("/login", async (req: Request, res: Response) => {
	try {
		const data = await Auth.loginUser(req.body.affiliation, req.body.loginName, req.body.password);

		res.json({
			success: true,
			data
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
	}
});

AuthRouter.post("/signup", async (req: Request, res: Response) => {
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
			success: true,
			data
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
	}
});

AuthRouter.post("/update_pass", checkAuthorization, async (req: Request, res: Response) => {
	try {
		await Auth.updatePassword(res.locals.auth.affiliation, res.locals.auth.id, req.body.current, req.body.new);

		res.json({
			success: true
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
	}
});

AuthRouter.get("/user_info", checkAuthorization, async (req: Request, res: Response) => {
	try {
		const data = await Auth.getUserInfo(res.locals.auth.affiliation, res.locals.auth.id);

		res.json({
			success: true,
			data
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
	}
});

export default AuthRouter;
