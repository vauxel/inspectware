import { Router, Request, Response } from "express";
const IndexRouter = Router();

IndexRouter.get("/", (req: Request, res: Response) => {
	res.render("index", {
		name: "inspectware"
	});
});

export default IndexRouter;