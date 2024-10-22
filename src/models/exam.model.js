const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const examSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    indexedDB: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      point: {
        type: Number,
        required: true,
      },
      options: [
        {
          option: {
            type: String,
            required: true,
          },
          isCorrect: {
            type: Boolean,
            required: true,
          },
        },
      ],
    },
  ],
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
