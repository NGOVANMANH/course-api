const ExamModel = require("../models/exam.model");
const { generateCode } = require("../utils/code-generator.util");

const examController = {
  // Create a new exam
  createExam: async (req, res, next) => {
    try {
      const { name, authorIds, questions } = req.body;

      // Validate required data
      if (!name || !authorIds || !questions) {
        return res.status(400).json({
          message:
            "Missing required data. Please provide 'name', 'authorIds', and 'questions'.",
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
        authorIds: authorIds,
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
      }).populate("authorIds", "name email");
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

      const isAuthOfExam = existingExam.authorIds.includes(user._id);

      if (!isAuthOfExam)
        return res
          .status(403)
          .json({
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
};

module.exports = examController;
