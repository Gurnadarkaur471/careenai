const mongoose = require("mongoose");

const assessmentResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
    answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedIndex: Number, correct: Boolean }],
    score: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // seconds
    categoryScores: { type: mongoose.Schema.Types.Mixed, default: {} },
    topicPerformance: { type: mongoose.Schema.Types.Mixed, default: {} },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssessmentResult", assessmentResultSchema);
