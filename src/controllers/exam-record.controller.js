const ExamRecord = require("../models/exam-record.model");
const Exam = require("../models/exam.model");

const examRecordController = {
  joinExam: async (req, res, next) => {
    try {
      const { code: examCode } = req.params;
      const user = req.user;
      if (!examCode) {
        return res.status(400).json({ message: "Missing required data." });
      }

      const existingExam = await Exam.findOne({ code: examCode });

      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      const existingExamRecord = await ExamRecord.findOne({
        examId: existingExam._id,
      });

      if (!existingExamRecord) {
        const records = [
          {
            userId: user._id,
            results: [],
          },
        ];

        const newExamRecord = new ExamRecord({
          examId: existingExam._id,
          records,
        });

        await newExamRecord.save();
      } else {
        const userRecordExists = existingExamRecord.records.some(
          (record) => record.userId.toString() === user._id.toString()
        );

        if (!userRecordExists) {
          // If the user does not have a record yet, add a new one
          existingExamRecord.records.push({
            userId: user._id,
            results: [],
          });
          await existingExamRecord.save(); // Await the save operation
        }
      }

      return res
        .status(200)
        .json({ message: `User ${user.studentId} joined exam ${examCode}.` });
    } catch (error) {
      next(error);
    }
  },
  saveExamSelections: async (req, res, next) => {
    try {
      const { questionId, selectedOptions } = req.body;
      if (!questionId || !selectedOptions || !Array.isArray(selectedOptions)) {
        return res.status(400).json({ message: "Missing or invalid data." });
      }

      const { code: examCode } = req.params;
      const user = req.user;

      // Find the exam by its code
      const existingExam = await Exam.findOne({ code: examCode });
      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      // Find the exam record for this exam and user
      const existingExamRecord = await ExamRecord.findOne({
        examId: existingExam._id,
        "records.userId": user._id,
      });

      if (!existingExamRecord) {
        return res
          .status(404)
          .json({ message: "User has not joined this exam." });
      }

      // Get the user's record within the exam
      const userRecord = existingExamRecord.records.find(
        (record) => record.userId.toString() === user._id.toString()
      );

      if (!userRecord) {
        return res
          .status(404)
          .json({ message: "User's exam record not found." });
      }

      // Find the existing result for the question, if any
      const existingResult = userRecord.results.find(
        (result) => result.questionId.toString() === questionId.toString()
      );

      if (existingResult) {
        // Update the selected options if the question was already answered
        existingResult.selectedOptions = selectedOptions;
      } else {
        // Add new result for the question
        userRecord.results.push({
          questionId,
          selectedOptions,
        });
      }

      // Save the updated exam record
      await existingExamRecord.save();

      return res
        .status(200)
        .json({ message: "Selections saved successfully." });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examRecordController;
