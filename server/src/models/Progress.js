const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    employabilityScore: Number,
    technicalScore: Number,
    aptitudeScore: Number,
    resumeScore: Number,
    communicationScore: Number,
    interviewScore: Number,
    skillScores: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
