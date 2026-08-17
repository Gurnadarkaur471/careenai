const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, default: "" },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    education: { type: String, default: "" },
    experience: { type: String, default: "" },
    responsibilities: [{ type: String }],
    location: { type: String, default: "" },
    jobType: { type: String, default: "Full-time" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    source: { type: String, enum: ["admin", "student-paste"], default: "student-paste" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
