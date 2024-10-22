const ExamModel = require("../models/exam.model");

const examController = {
  // Create a new exam
  createExam: async (req, res, next) => {
    try {
      const { code, authorIds, questions } = req.body;

      // Validate required data
      if (!code || !authorIds || !questions) {
        return res.status(400).json({ message: "Missing required data." });
      }

      // Check if an exam with the same code already exists
      const existingExam = await ExamModel.findOne({ code });
      if (existingExam) {
        return res.status(400).json({ message: "Exam code already exists." });
      }

      // Create new exam
      const newExam = new ExamModel({
        code,
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
      const exam = await ExamModel.findOne({ code }).populate(
        "authorIds",
        "name email"
      );
      if (!exam) {
        return res.status(404).json({ message: "Exam not found." });
      }

      return res.status(200).json({ exam });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = examController;
