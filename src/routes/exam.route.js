const express = require("express");
const examController = require("../controllers/exam.controller");

const router = express.Router();

router.post("/", examController.createExam);
router.get("/:code", examController.getExamByCode);

module.exports = router;
