const ExamRecord = require("../models/exam-record.model");
const Exam = require("../models/exam.model");
const ExamModel = require("../models/exam.model");
const { generateCode } = require("../utils/code-generator.util");

const examController = {
  // Create a new exam
  createExam: async (req, res, next) => {
    try {
      const { name, startTime, endTime, duration, questions } = req.body;
      const { _id: userId } = req.user;

      // Validate required data
      if (!name || !startTime || !endTime || !duration || !questions) {
        return res.status(400).json({
          message: "Missing required data.",
        });
      }

      let existingExam;
      let code;

      // Generate a unique exam code
      do {
        code = generateCode().toUpperCase(); // Generate and convert to uppercase for consistency
        existingExam = await ExamModel.findOne({ code });
      } while (existingExam);

      // Create new exam with unique code
      const newExam = new ExamModel({
        code,
        name,
        startTime,
        endTime,
        duration,
        authorId: userId,
        questions,
      });

      // Save the exam to the database
      const savedExam = await newExam.save();

      return res
        .status(201)
        .json({ message: "Exam created successfully.", exam: savedExam });
    } catch (error) {
      next(error);
    }
  },

  // Get an exam by its code
  getExamByCode: async (req, res, next) => {
    try {
      const { code } = req.params;

      // Find exam by code
      const exam = await ExamModel.findOne({
        code: code.toUpperCase(),
      }).populate("authorId", "name email");
      if (!exam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      return res.status(200).json({ exam });
    } catch (error) {
      next(error);
    }
  },

  // delete exam by its _id
  deleteExamById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!id)
        return res.status(400).json({ message: "Id field is required!" });

      // Check if the exam exists
      const existingExam = await ExamModel.findById(id);
      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      const isAuthOfExam =
        existingExam.authorId.toString() === user._id.toString();

      if (!isAuthOfExam)
        return res.status(403).json({
          message: "Access denied. You are not an author of this exam.",
        });

      const deletedExam = await ExamModel.findByIdAndDelete(id);

      if (!deletedExam)
        return res.status(404).json({ message: "Exam not found." });

      return res
        .status(200)
        .json({ message: "Exam deleted.", exam: deletedExam });
    } catch (error) {
      next(error);
    }
  },
  // Get exams grouped by user
  getExams: async (req, res, next) => {
    const { type } = req.query;
    const user = req.user;

    try {
      switch (type) {
        case "created":
          // Fetch exams created by the teacher
          if (user.role.toLowerCase() === "teacher") {
            const exams = await Exam.find({ authorId: user._id });
            if (!exams || exams.length === 0) {
              return res.status(404).json({ message: "Exams not found." });
            }
            return res.status(200).json({ exams });
          } else {
            return res.status(403).json({
              message: "Access denied. Only teachers can view created exams.",
            });
          }

        case "taken":
          // Fetch exam records where the user has participated
          const records = await ExamRecord.find({
            "records.userId": user._id,
          }).populate("examId", "code name startTime endTime duration"); // Only populate basic exam info

          if (!records || records.length === 0) {
            return res.status(404).json({ message: "No exam records found." });
          }

          // Manually retrieve the questions and results
          const populatedRecords = await Promise.all(
            records.map(async (record) => {
              const exam = await Exam.findById(record.examId).select(
                "questions"
              ); // Get questions directly from the Exam model
              return {
                examInfo: record.examId,
                questions: exam.questions, // Attach the questions
                userResults: record.records.find((r) =>
                  r.userId.equals(user._id)
                ).results,
              };
            })
          );

          return res.status(200).json({ exams: populatedRecords });

        default:
          // Fallback case: Fetch all available exams (could be used for admins or general access)
          const allExams = await Exam.find({});
          if (!allExams || allExams.length === 0) {
            return res.status(404).json({ message: "No exams found." });
          }
          return res.status(200).json({ exams: allExams });
      }
    } catch (error) {
      next(error); // Handle any errors
    }
  },
};

module.exports = examController;
