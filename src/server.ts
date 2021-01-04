import { join } from "path";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import sassMiddleware from "node-sass-middleware";
import cors from "cors";
const port = 4040;

import Auth from "./classes/auth";

if (!process.argv.includes("-staticsecret")) {
	Auth.generateSecret();
} else {
	console.log("! Auth using static, debugging secret !");
}

import { Email } from "./classes/email";

Email.instantiateTransporter();
Email.loadGenericTemplate();

import { Templating } from "./classes/templating";

Templating.configureEngine();

import indexRouter from "@routes/index";
import authRouter from "@routes/auth";
import schedulingRouter from "@routes/scheduling";
import inspectorRouter from "@routes/inspector";
import inspectionRouter from "@routes/inspection";
import accountRouter from "@routes/account";
import docRouter from "@routes/document";

mongoose.connect("mongodb://localhost:27017/inspectware", {useNewUrlParser: true});

const server = express();
server.set("view engine", "pug");
server.use(bodyParser.json());
server.use(cors());
server.use(sassMiddleware({
	src: "public/css",
	indentedSyntax: false,
	outputStyle: "compressed",
	prefix: "/css"
}));
server.use(express.static("public"));

server.use((req, res, next) => {
	console.log(new Date().toLocaleTimeString(), req.method, req.url);
	next();
});

server.use("/", indexRouter);
server.use("/api/auth", authRouter);
server.use("/api/scheduling", schedulingRouter);
server.use("/api/inspector", inspectorRouter);
server.use("/api/inspection", inspectionRouter);
server.use("/api/account", accountRouter);
server.use("/doc", docRouter);

const dashboard = express();
dashboard.use(express.static(join(__dirname, "../dashboard/dist")));
dashboard.use("*", (req, res) => {
	res.sendFile(join(__dirname, "../dashboard/dist/index.html"));
});

server.use("/dash", dashboard);

server.listen(port, () => {
	console.log(`Server started on port ${port}`);
});