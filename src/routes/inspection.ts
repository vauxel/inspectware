import { Router, Request, Response } from "express";
import { Inspector } from "@classes/inspector";
import { Inspection } from "@classes/inspection";
import { restrictAuthorization, restrictNonInspectors } from "@routes/restrictions";
import Util from "@classes/util";

const InspectionRouter = Router();

InspectionRouter.get("/general_info", restrictAuthorization, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const inspection = await Util.resolveInspection(req.query.id);
		const data = await Inspection.getGeneralInfo(inspection);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default InspectionRouter;
