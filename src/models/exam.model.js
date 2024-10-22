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

// Virtual field to calculate the total score for all questions in the exam
examSchema.virtual("totalScore").get(function () {
  return this.questions.reduce((sum, question) => sum + question.point, 0);
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
