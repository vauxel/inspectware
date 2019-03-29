import { Router, Request, Response } from "express";
const AuthRouter = Router();

AuthRouter.post("/login", (req: Request, res: Response) => {
	res.json({
		status: "success"
	});
});

export default AuthRouter;