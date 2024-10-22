const ExamModel = require("../models/exam.model");
const { create } = require("../models/user.model");

const examController = {
  createExam: async (req, res) => {
    try {
      const { code, questions } = req.body;
      console.log(req.body);
      const newExam = new ExamModel({ code, questions });
      await newExam.save();
      res.status(201).json({ message: "Exam created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error creating exam", error });
    }
  },
  getExamByCode: async (req, res) => {
    try {
      const examCode = req.params.code;
      const exam = await ExamModel.findById({ code: examCode });
      res.status(200).json(exam);
    } catch (error) {
      res.status(500).json({ message: "Error getting exam", error });
    }
  },
};

module.exports = examController;
