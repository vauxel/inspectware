import { join } from "path";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import sassMiddleware from "node-sass-middleware";
import cors from "cors";
const port = 4040;

import Auth from "./classes/auth";

Auth.generateSecret();

import indexRouter from "./routes/index";
import authRouter from "./routes/auth";
import schedulingRouter from "./routes/scheduling";

mongoose.connect("mongodb://localhost:27017/inspectware", {useNewUrlParser: true});

const server = express();
server.set("view engine", "pug");
server.use(bodyParser.json());
server.use(cors());
server.use(sassMiddleware({
	src: join(__dirname, "../public/css"),
	indentedSyntax: false,
	outputStyle: "compressed",
	prefix: "/css"
}));
server.use(express.static(join(__dirname, "../public")));

server.use("/", indexRouter);
server.use("/api/auth", authRouter);
server.use("/api/scheduling", schedulingRouter);

const dashboard = express();
dashboard.use(express.static(join(__dirname, "../dashboard/dist")));
dashboard.use("*", (req, res) => {
	res.sendFile(join(__dirname, "../dashboard/dist/index.html"));
});

server.use("/dash", dashboard);

server.use((req, res, next) => {
	console.log(new Date().toLocaleTimeString(), req.method, req.url);
	next();
});

server.listen(port, () => {
	console.log(`Server started on port ${port}`);
});