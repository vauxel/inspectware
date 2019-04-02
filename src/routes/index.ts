import { Router, Request, Response } from "express";
const IndexRouter = Router();

IndexRouter.get("/", (req: Request, res: Response) => {
	res.render("index", {
		name: "inspectware"
	});
});

IndexRouter.get("/signup", (req: Request, res: Response) => {
	res.render("signup");
});

export default IndexRouter;
