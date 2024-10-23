const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const examSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v >= Date.now();
        },
        message: () =>
          `Start time must be greater than or equal to the current time.`,
      },
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v >= this.startTime;
        },
        message: () => `End time must be greater than start time.`,
      },
    },
    duration: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          const durationInMs = this.endTime - this.startTime;
          return v > 0 && v <= durationInMs;
        },
        message: () =>
          `Duration must in the time range between startTime and endTime.`,
      },
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
              default: false,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    virtuals: true,
  }
);

// Virtual field to calculate the total score for all questions in the exam
examSchema.virtual("totalScore").get(function () {
  return this.questions.reduce((sum, question) => sum + question.point, 0);
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
