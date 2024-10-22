const express = require("express");

const router = express.Router();

// Example route
router.use("/auth", require("./auth.route"));
router.use("/exam", require("./exam.route"));

module.exports = router;
