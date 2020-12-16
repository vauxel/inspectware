import { Router, Request, Response } from "express";
import { Inspector } from "@classes/inspector";
import { Inspection } from "@classes/inspection";
import { IDocument } from "@classes/document";
import { restrictAuthorization, restrictNonInspectors } from "@routes/restrictions";
import Util from "@classes/util";

const IDocumentRouter = Router();

IDocumentRouter.get("/invoice/:id", async (req: Request, res: Response) => {
	try {
		const inspection = await Util.resolveInspection(req.params.id);
		const idocument = await Util.resolveIDocument(inspection.get("payment").doc);
		IDocument.checkAuthorizationToken(idocument, <string>req.query.token)
		const data = await IDocument.serveDocument(idocument);
		IDocument.logAuthorizationAccess(idocument, <string>req.query.token, req.ip);

		res.send(data);
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default IDocumentRouter;
