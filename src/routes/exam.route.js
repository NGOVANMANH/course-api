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
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.controlRoleAccess(["TEACHER"]),
  examController.deleteExamById
);
router.get(
  "/:code/join",
  authMiddleware.verifyToken,
  examRecordController.joinExam
);
router.patch(
  "/:code/save-selected-options",
  authMiddleware.verifyToken,
  examRecordController.saveExamSelections
);
router.get(
  "/:code/record",
  authMiddleware.verifyToken,
  examRecordController.getExamRecordByExamCode
);
router.get("/:code", authMiddleware.verifyToken, examController.getExamByCode);
router.get("/", authMiddleware.verifyToken, examController.getExams);

module.exports = router;
