import { Router, Request, Response } from "express";
import { Auth } from "../classes/auth";

const AuthRouter = Router();

AuthRouter.post("/login", async (req: Request, res: Response) => {
	try {
		let data = await Auth.loginUser(req.body.affiliation, req.body.loginname, req.body.password);

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
		let data = await Auth.registerAccount(
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

export default AuthRouter;
