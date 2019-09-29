import { Router, Request, Response } from "express";
import Account from "@/models/account";
const IndexRouter = Router();

IndexRouter.get("/", (req: Request, res: Response) => {
	res.render("index", {
		name: "inspectware"
	});
});

IndexRouter.get("/signup", (req: Request, res: Response) => {
	res.render("signup");
});

IndexRouter.get("/scheduler/:id", async (req: Request, res: Response) => {
	let account = await Account.findById(req.params.id);

	if (!account) {
		res.status(404);
		res.json({
			status: "error",
			message: "An account by that id does not exist"
		});
	} else {
		res.render("scheduler", {
			accountId: req.params.id,
			accountName: account.get("name"),
			apiURL: req.protocol + "://" + req.get("host")
		});
	}
});

export default IndexRouter;
