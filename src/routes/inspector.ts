import { Router, Request, Response } from "express";
import { Inspector } from "@classes/inspector";
import { restrictAuthorization, restrictNonInspectors } from "@routes/restrictions";
import Util from "@classes/util";

const InspectorRouter = Router();

InspectorRouter.get("/inspections", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const data = await Inspector.getInspections(inspector);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectorRouter.get("/timeslots", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const data = Inspector.getTimeslots(inspector);

		res.status(200).json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectorRouter.post("/timeslots", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = await Inspector.addTimeslot(inspector, req.body.day, parseInt(req.body.time));
		
		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectorRouter.delete("/timeslots/:day/:time", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = await Inspector.removeTimeslot(inspector, req.params.day, parseInt(req.params.time));

		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectorRouter.get("/timeoff", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const data = Inspector.getTimeoff(inspector);

		res.status(200).json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectorRouter.post("/timeoff", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = await Inspector.addTimeoff(inspector, req.body.date, req.body.time);

		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

InspectorRouter.delete("/timeoff/:date/:time", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = await Inspector.removeTimeoff(inspector, req.params.date, parseInt(req.params.time));

		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default InspectorRouter;
