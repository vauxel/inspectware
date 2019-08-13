import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import Auth from "../classes/auth";

export function checkAuthorization(req: Request, res: Response, next: any) {
    if (req.headers.authorization != undefined) {
		try {
			const authData = verify(req.headers.authorization, Auth.getSecret());
			res.locals.auth = authData;
			next();
		} catch (err) {
			res.status(401);
			return res.json({ success: false, error: { message: "Invalid auth token" } });
		}
	} else {
		res.status(401);
		return res.json({ success: false, error: { message: "Auth token not supplied" } });
	}
};