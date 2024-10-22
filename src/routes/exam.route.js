const express = require("express");
const examController = require("../controllers/exam.controller");
const examRecordController = require("../controllers/exam-record.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.controlRoleAccess(["TEACHER"]),
  examController.createExam
);
router.get(
  "/:code/join",
  authMiddleware.verifyToken,
  authMiddleware.controlRoleAccess(["TEACHER", "STUDENT"]),
  examRecordController.joinExam
);
router.patch(
  "/:code/save-selected-options",
  authMiddleware.verifyToken,
  authMiddleware.controlRoleAccess(["TEACHER", "STUDENT"]),
  examRecordController.saveExamSelections
);
router.get("/:code", examController.getExamByCode);

module.exports = router;
