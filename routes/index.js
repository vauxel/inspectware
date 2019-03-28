const index = require("express").Router();

index.get("/", (req, res, next) => {
	res.render("index", {
		name: "inspectware"
	});
});

module.exports = index;