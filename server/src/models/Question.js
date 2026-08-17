const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: v => v.length >= 2 },
    correctAnswerIndex: { type: Number, required: true },
    category: { type: String, enum: ["aptitude", "technical"], required: true },
    topic: { type: String, required: true }, // e.g. DSA, SQL, Quantitative, Verbal
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    explanation: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
