const mongoose = require("mongoose");

const careerSimulationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    currentScore: { type: Number, required: true },
    targetScore: { type: Number },
    selectedImprovements: [
      { category: String, fromValue: Number, toValue: Number },
    ],
    simulatedScore: { type: Number, required: true },
    scoreDifference: { type: Number, required: true },
    calculationBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    explanation: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerSimulation", careerSimulationSchema);
