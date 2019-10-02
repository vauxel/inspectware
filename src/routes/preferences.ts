import { Router, Request, Response } from "express";
import { Availability } from "@/classes/preferences";
import { restrictAuthorization, restrictNonInspectors } from "@/routes/restrictions";
import Util from "@/classes/util";

const PreferencesRouter = Router();

PreferencesRouter.get("/timeslots", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const data = Availability.getTimeslots(inspector);

		res.status(200).json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

PreferencesRouter.post("/timeslots", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = Availability.addTimeslot(inspector, req.body.day, parseInt(req.body.time));
		
		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

PreferencesRouter.delete("/timeslots/:day/:time", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = Availability.removeTimeslot(inspector, req.params.day, parseInt(req.params.time));

		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

PreferencesRouter.get("/timeoff", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const data = Availability.getTimeoff(inspector);

		res.status(200).json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

PreferencesRouter.post("/timeoff", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = Availability.addTimeoff(inspector, req.body.date, req.body.time);

		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

PreferencesRouter.delete("/timeoff/:date/:time", restrictAuthorization, restrictNonInspectors, async (req: Request, res: Response) => {
	try {
		const inspector = await Util.resolveInspector(res.locals.auth.id);
		const success = Availability.removeTimeoff(inspector, req.params.date, parseInt(req.params.time));

		res.status(200).json({ status: 200 });
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default PreferencesRouter;
