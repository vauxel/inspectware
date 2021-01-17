import { Router, Request, Response } from "express";
import { Scheduler } from "@classes/scheduling";
import Util from "@classes/util";

const SchedulingRouter = Router();

SchedulingRouter.get("/services", async (req: Request, res: Response) => {
	try {
		const account = await Util.resolveAccount(<string>req.query.account);
		const data = await Scheduler.getServices(account);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

SchedulingRouter.get("/pricing", async (req: Request, res: Response) => {
	try {
		const account = await Util.resolveAccount(<string>req.query.account);
		const data = Scheduler.calculatePricing(
			account,
			(<any>req.query.services) ? (<any>req.query.services).split("|") : undefined,
			parseInt(<string>req.query.sqft),
			parseInt(<string>req.query.year_built),
			<string>req.query.foundation
		);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

SchedulingRouter.get("/availabilities", async (req: Request, res: Response) => {
	try {
		const account = await Util.resolveAccount(<string>req.query.account);
		const data = await Scheduler.getAvailabilities(
			account,
			<string>req.query.from,
			<string>req.query.until
		);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

SchedulingRouter.post("/schedule", async (req: Request, res: Response) => {
	try {
		const account = await Util.resolveAccount(<string>req.query.account);
		const data = await Scheduler.schedule(
			account,
			req.body.services,
			req.body.property,
			req.body.appointment,
			req.body.client1,
			req.body.client2,
			req.body.realtor
		);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

SchedulingRouter.get("/exists_client", async (req: Request, res: Response) => {
	try {
		const account = await Util.resolveAccount(<string>req.query.account);
		const data = await Scheduler.getClientExists(<string>req.query.email);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

SchedulingRouter.get("/exists_realtor", async (req: Request, res: Response) => {
	try {
		const account = await Util.resolveAccount(<string>req.query.account);
		const data = await Scheduler.getRealtorExists(<string>req.query.email);

		res.json({
			status: 200,
			data
		});
	} catch (e) {
		Util.handleError(e, res);
	}
});

export default SchedulingRouter;
