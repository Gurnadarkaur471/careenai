const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // absent for OAuth-only accounts
    role: { type: String, enum: ["STUDENT", "ADMIN"], default: "STUDENT" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    branch: { type: String, trim: true },
    semester: { type: String, trim: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailPreferences: {
      assessmentResults: { type: Boolean, default: true },
      interviewReports: { type: Boolean, default: true },
      resumeAnalysis: { type: Boolean, default: true },
      careerProgress: { type: Boolean, default: true },
      careerRecommendations: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
