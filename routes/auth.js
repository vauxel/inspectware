const auth = require("express").Router();

auth.post("/login", (req, res, next) => {
	res.json({
		status: "success"
	});
});

module.exports = auth;