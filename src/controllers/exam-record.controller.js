const ExamRecordModel = require("../models/exam-record.model");
const { getExamByCode } = require("./exam.controller");

const examRecordController = {
  getExamRecordByCode: async (req, res) => {
    try {
      examCode = req.params.code;
      const examRecord = await ExamRecordModel.findOne({ code: examCode });
      res.status(200).json(examRecord);
    } catch (error) {
      res.status(500).json({ message: "Error getting exam record", error });
    }
  },
  saveExamRecord: async (req, res) => {
    try {
    } catch (error) {}
  },
};

module.exports = examController;
