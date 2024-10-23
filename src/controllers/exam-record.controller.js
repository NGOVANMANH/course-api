const { response } = require("express");
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

      return res.status(200).json({
        message: `User ${
          user.role.toLowerCase() === "student" ? user.studentId : user.name
        } joined exam ${examCode}.`,
      });
    } catch (error) {
      next(error);
    }
  },
  saveExamSelections: async (req, res, next) => {
    try {
      const { questionId, selectedOptionIds } = req.body;
      if (
        !questionId ||
        !selectedOptionIds ||
        !Array.isArray(selectedOptionIds)
      ) {
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
        existingResult.selectedOptionIds = selectedOptionIds;
      } else {
        // Add new result for the question
        userRecord.results.push({
          questionId,
          selectedOptionIds,
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

  getExamRecordByExamCode: async (req, res, next) => {
    try {
      const { code: examCode } = req.params;
      const { role, _id: userId } = req.user;

      const existingExam = await Exam.findOne({ code: examCode }).populate({
        path: "authorId",
        select: "name email",
      });
      if (!existingExam)
        return res.status(404).json({ message: "Exam not found." });

      const { questions, _id: examId } = existingExam;
      const totalScore = existingExam.totalScore;

      const existingExamRecord = await ExamRecord.findOne({ examId }).populate({
        path: "records.userId",
        select: "name email",
      });
      if (!existingExamRecord)
        return res.status(404).json({ message: "No record found." });

      const calculateRecordScore = (record) => {
        let score = 0;

        record.results.forEach((result) => {
          // Find the question in the exam using questionId
          const question = questions.find(
            (q) => q._id.toString() === result.questionId.toString()
          );

          if (question) {
            // Check if all selected options match the correct options
            const correctOptionIds = question.options
              .filter((opt) => opt.isCorrect)
              .map((opt) => opt._id.toString());

            const selectedOptionIds = result.selectedOptionIds.map((id) =>
              id.toString()
            );

            // Check if selected options match the correct options exactly
            const isCorrect =
              correctOptionIds.length === selectedOptionIds.length &&
              correctOptionIds.every((id) => selectedOptionIds.includes(id));

            // If the answer is correct, add the question's points to the score
            if (isCorrect) {
              score += question.point;
            }
          }
        });

        return score;
      };

      const { records } = existingExamRecord;

      const responseExam = existingExam.toObject();
      responseExam.author = responseExam.authorId;
      delete responseExam.authorId;

      switch (role.toLowerCase()) {
        case "student":
          const studentRecord = records.find(
            (record) => record.userId.toString() === userId.toString()
          );

          if (!studentRecord) {
            return res
              .status(404)
              .json({ message: "No record found for the student." });
          }

          // Calculate the student's score
          const studentScore = calculateRecordScore(studentRecord);

          return res.status(200).json({
            exam: responseExam,
            score: studentScore,
            record: studentRecord,
            totalScore: totalScore,
          });
        case "teacher":
          const studentsRecordsWithScores = records.map((record) => ({
            user: record.userId,
            score: calculateRecordScore(record),
            result: record.results,
          }));

          return res.status(200).json({
            exam: responseExam,
            totalScore: totalScore,
            records: studentsRecordsWithScores,
          });
        default:
          return res.status(403).json({ message: "Access denied." });
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examRecordController;
