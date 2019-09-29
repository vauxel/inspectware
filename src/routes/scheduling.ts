import { Router, Request, Response } from "express";
import { Scheduler } from "@/classes/scheduling";

const SchedulingRouter = Router();

SchedulingRouter.get("/services", async (req: Request, res: Response) => {
	try {
		const data = await Scheduler.getServices(req.query.account);

		res.json({
			success: true,
			data
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
	}
});

SchedulingRouter.get("/pricing", async (req: Request, res: Response) => {
	try {
		const data = await Scheduler.calculatePricing(
			req.query.account,
			req.query.services ? req.query.services.split("|") : undefined,
			req.query.sqft,
			req.query.age,
			req.query.foundation
		);

		res.json({
			success: true,
			data
		});
	} catch (e) {
		res.json({
			success: false,
			error: {
				message: e.getMessage
			}
		});
	}
});

export default SchedulingRouter;
