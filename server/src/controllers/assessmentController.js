const Assessment = require("../models/Assessment");
const Question = require("../models/Question");
const AssessmentResult = require("../models/AssessmentResult");
const StudentProfile = require("../models/StudentProfile");
const Progress = require("../models/Progress");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const { recomputeEmployabilityScore } = require("./studentController");
const { notifyAndEmail, templates } = require("../services/notificationService");

const listAssessments = asyncHandler(async (req, res) => {
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  const assessments = await Assessment.find(filter).select("-questions");
  return success(res, { assessments });
});

const getAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id).populate({
    path: "questions",
    select: "-correctAnswerIndex -explanation", // never leak the answer key to the frontend
  });
  if (!assessment) return fail(res, "Assessment not found.", 404);
  return success(res, { assessment });
});

/** Scoring happens ONLY on the backend — the frontend never determines correctness. */
const submitAssessment = asyncHandler(async (req, res) => {
  const { answers = [], timeTaken = 0 } = req.body; // answers: [{questionId, selectedIndex}]
  const assessment = await Assessment.findById(req.params.id).populate("questions");
  if (!assessment) return fail(res, "Assessment not found.", 404);

  const questionMap = new Map(assessment.questions.map((q) => [String(q._id), q]));
  const topicScores = {}; // topic -> {correct, total}
  const gradedAnswers = [];

  for (const ans of answers) {
    const q = questionMap.get(String(ans.questionId));
    if (!q) continue;
    const correct = q.correctAnswerIndex === ans.selectedIndex;
    gradedAnswers.push({ questionId: q._id, selectedIndex: ans.selectedIndex, correct });

    if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
    topicScores[q.topic].total += 1;
    if (correct) topicScores[q.topic].correct += 1;
  }

  const totalCorrect = gradedAnswers.filter((a) => a.correct).length;
  const totalQuestions = assessment.questions.length || 1;
  const score = Math.round((totalCorrect / totalQuestions) * 100);
  const accuracy = score;

  const topicPerformance = {};
  for (const [topic, v] of Object.entries(topicScores)) {
    topicPerformance[topic] = Math.round((v.correct / v.total) * 100);
  }

  const result = await AssessmentResult.create({
    studentId: req.user._id,
    assessmentId: assessment._id,
    answers: gradedAnswers,
    score,
    accuracy,
    timeTaken,
    categoryScores: { [assessment.category]: score },
    topicPerformance,
  });

  // Feed into the student's component scores (aptitude vs technical).
  const field = assessment.category === "aptitude" ? "aptitude" : "technical";
  await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { [`componentScores.${field}`]: score } },
    { upsert: true }
  );
  const updatedProfile = await recomputeEmployabilityScore(req.user._id);

  await Progress.create({
    studentId: req.user._id,
    employabilityScore: updatedProfile.employabilityScore,
    technicalScore: updatedProfile.componentScores.technical,
    aptitudeScore: updatedProfile.componentScores.aptitude,
    resumeScore: updatedProfile.componentScores.resume,
    communicationScore: updatedProfile.componentScores.communication,
    interviewScore: updatedProfile.componentScores.interview,
  });

  notifyAndEmail({
    user: req.user,
    type: "assessment-result",
    title: "Assessment Completed",
    message: `${assessment.title}: ${score}%`,
    link: "/progress",
    emailPrefKey: "assessmentResults",
    emailHtml: templates.assessmentResult(assessment.title, score, `${process.env.CLIENT_URL}/progress`),
    subject: "Assessment Completed",
  });

  return success(res, { result, employabilityScore: updatedProfile.employabilityScore });
});

const listResults = asyncHandler(async (req, res) => {
  const results = await AssessmentResult.find({ studentId: req.user._id })
    .populate("assessmentId", "title category")
    .sort({ completedAt: -1 });
  return success(res, { results });
});

module.exports = { listAssessments, getAssessment, submitAssessment, listResults };
