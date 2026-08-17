const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    interviewType: { type: String, enum: ["full", "technical", "hr", "behavioral"], default: "full" },
    questions: [
      {
        question: String,
        category: { type: String, enum: ["Introduction", "Technical", "Resume", "Project", "HR", "Behavioral"] },
      },
    ],
    answers: [
      {
        questionIndex: Number,
        answerText: String,
        scores: {
          technicalScore: Number,
          relevanceScore: Number,
          structureScore: Number,
          completenessScore: Number,
        },
        starAnalysis: {
          situation: Boolean,
          task: Boolean,
          action: Boolean,
          result: Boolean,
        },
        feedback: String,
        missingConcepts: [String],
      },
    ],
    finalScore: { type: Number, default: null },
    scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    feedback: { type: String, default: "" },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
