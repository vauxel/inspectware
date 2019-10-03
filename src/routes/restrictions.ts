import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import Auth from "@/classes/auth";

export function restrictAuthorization(req: Request, res: Response, next: any) {
	if (req.headers.authorization != undefined) {
		let authParts = req.headers.authorization.split(" ");

		if (authParts.length == 2 && authParts[0] == "Bearer" && authParts[1] != "") {
			try {
				const authData = verify(authParts[1], Auth.getSecret());
				res.locals.auth = authData;
	
				if (res.locals.auth.affiliation == undefined || res.locals.auth.id == undefined) {
					return res.status(401).json({ status: 401, error: { message: "Invalid auth token payload" } });
				} else {
					next();
				}
			} catch (err) {
				return res.status(401).json({ status: 401, error: { message: "Invalid auth token" } });
			}
		} else {
			return res.status(401).json({ status: 401, error: { message: "Invalid auth header format" } });
		}
	} else {
		return res.status(401).json({ status: 401, error: { message: "Authorization header not supplied" } });
	}
}

export function restrictNonInspectors(this: any, req: Request, res: Response, next: any) {
	if (res.locals.auth.affiliation != "inspector") {
		res.status(401);
		return res.json({ status: 401, error: { message: "Unauthorized affiliation (inspector only)" } });
	} else {
		next();
	}
};

export function restrictNonRealtors(this: any, req: Request, res: Response, next: any) {
	if (res.locals.auth.affiliation != "realtor") {
		res.status(401);
		return res.json({ status: 401, error: { message: "Unauthorized affiliation (realtor only)" } });
	} else {
		next();
	}
};

export function restrictNonClients(this: any, req: Request, res: Response, next: any) {
	if (res.locals.auth.affiliation != "client") {
		res.status(401);
		return res.json({ status: 401, error: { message: "Unauthorized affiliation (client only)" } });
	} else {
		next();
	}
};
