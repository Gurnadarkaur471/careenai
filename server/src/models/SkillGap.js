const mongoose = require("mongoose");

const skillGapSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, required: true },
    skill: { type: String, required: true },
    status: { type: String, enum: ["strong", "needs-improvement", "missing"], required: true },
    currentLevel: { type: Number, default: 0 }, // 0-100
    requiredLevel: { type: Number, default: 70 },
    priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },
    reason: { type: String, default: "" },
    recommendation: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkillGap", skillGapSchema);
