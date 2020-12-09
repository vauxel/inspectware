import { Router, Request, Response } from "express";
import { Inspector } from "@classes/inspector";
import { Inspection } from "@classes/inspection";
import { restrictAuthorization, restrictNonInspectors } from "@routes/restrictions";
import Util from "@classes/util";

const InspectionRouter = Router();

InspectionRouter.get("/info", restrictAuthorization, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const inspection = await Util.resolveInspection(<string>req.query.id);
		const data = await Inspection.getInfo(inspection);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectionRouter.post("/property_info", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const inspection = await Util.resolveInspection(req.body.id);
		const success = await Inspection.updatePropertyDetails(
			inspection,
			req.body.address1,
			req.body.address2,
			req.body.city,
			req.body.state,
			req.body.zip,
			req.body.sqft,
			req.body.year_built,
			req.body.foundation
		);
		
		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default InspectionRouter;
