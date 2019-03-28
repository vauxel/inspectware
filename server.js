const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sassMiddleware = require("node-sass-middleware");
const port = 4040;

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");

// Connect to MongoDB

const server = express();
server.set("view engine", "pug");
server.use(bodyParser.json());
server.use(sassMiddleware({
	src: path.join(__dirname, "public/css"),
	indentedSyntax: false,
	outputStyle: "compressed",
	prefix: "/css"
}));
server.use(express.static(path.join(__dirname, "public")));

server.use("/", indexRouter);
server.use("/api/auth", authRouter);

const dashboard = express();
dashboard.use(express.static(path.join(__dirname, "dashboard/dist")));
dashboard.use("*", (req, res) => {
	res.sendFile(path.join(__dirname, "dashboard/dist/index.html"));
});

server.use("/dash", dashboard);

server.listen(port, () => {
	console.log(`Server started on port ${port}`);
});