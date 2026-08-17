const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: String,
    filePath: String,
    fileType: String,
    extractedText: String,
    extractedSkills: [{ type: String }],
    projects: [{ type: mongoose.Schema.Types.Mixed }],
    education: [{ type: mongoose.Schema.Types.Mixed }],
    certifications: [{ type: mongoose.Schema.Types.Mixed }],
    experience: [{ type: mongoose.Schema.Types.Mixed }],
    resumeScore: { type: Number, default: 0 },
    analysis: {
      completeness: Number,
      skillRelevance: Number,
      projectRelevance: Number,
      keywordCoverage: Number,
      sectionCompleteness: Number,
      suggestions: [String],
      aiExplanation: String,
      aiGenerated: { type: Boolean, default: false },
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
