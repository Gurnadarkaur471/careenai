const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    college: String,
    course: String,
    branch: String,
    semester: String,
    academicPerformance: { type: Number, min: 0, max: 100 },
    skills: [{ type: String }],
    softSkills: [{ type: String }],
    certifications: [{ name: String, issuer: String, year: String }],
    projects: [{ title: String, description: String, techStack: [String] }],
    experience: [{ role: String, company: String, duration: String, description: String }],
    targetRole: { type: String, default: "Software Developer" },
    targetGoal: { type: String, default: "Land my first job" },
    careerInterests: [{ type: String }],

    // Deterministic component scores (0-100), used by scoringEngine
    componentScores: {
      technical: { type: Number, default: 0 },
      aptitude: { type: Number, default: 0 },
      resume: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      interview: { type: Number, default: 0 },
    },

    employabilityScore: { type: Number, default: 0 },
    scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
