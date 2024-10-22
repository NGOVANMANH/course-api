const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const examSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  authorIds: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  ],
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
            default: false,
          },
        },
      ],
    },
  ],
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
