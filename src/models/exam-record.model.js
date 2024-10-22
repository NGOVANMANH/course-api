const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExamRecordSchema = new Schema({
  examCode: {
    type: String,
    required: true,
  },
  joiner: [
    {
      studentId: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
    },
  ],
});

const ExamRecord = mongoose.model("ExamRecord", ExamRecordSchema);

module.exports = ExamRecord;
