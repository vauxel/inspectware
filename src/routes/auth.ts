import { Router, Request, Response } from "express";
import { Auth } from "../classes/auth";

const AuthRouter = Router();

AuthRouter.post("/login", async (req: Request, res: Response) => {
	try {
		let {userId, name} = await Auth.loginUser(req.body.affiliation, req.body.loginname, req.body.password);

		res.json({
			success: true,
			data: {
				userId,
				name
			}
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
		return;
	}
});

export default AuthRouter;