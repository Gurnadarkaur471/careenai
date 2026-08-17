const Interview = require("../models/Interview");
const StudentProfile = require("../models/StudentProfile");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const Progress = require("../models/Progress");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const aiService = require("../services/aiService");
const { recomputeEmployabilityScore } = require("./studentController");
const { notifyAndEmail, templates } = require("../services/notificationService");

const FALLBACK_QUESTION_BANK = {
  Introduction: ["Tell me about yourself and your career goals."],
  Resume: ["Walk me through the most relevant project on your resume."],
  Technical: ["Explain a technical concept you recently learned and how you'd apply it.", "How would you approach debugging a production issue you've never seen before?"],
  Project: ["What was the hardest technical decision on your best project, and why?"],
  HR: ["Why do you want to work in this role?"],
  Behavioral: ["Describe a time you disagreed with a teammate. What did you do? (Use Situation, Task, Action, Result.)"],
};

const generateInterview = asyncHandler(async (req, res) => {
  const { targetRole, jobId, interviewType = "full" } = req.body;
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  const role = targetRole || profile?.targetRole || "Software Developer";

  const latestResume = await Resume.findOne({ studentId: req.user._id }).sort({ createdAt: -1 });
  const job = jobId ? await Job.findById(jobId) : null;

  let questions = [];
  let aiGenerated = false;

  if (aiService.isConfigured()) {
    try {
      const aiResult = await aiService.generateInterviewQuestions({
        resumeSummary: latestResume?.extractedSkills?.join(", "),
        targetRole: role,
        jobDescription: job?.description,
        projects: latestResume?.projects,
      });
      if (aiResult?.questions?.length) {
        questions = aiResult.questions;
        aiGenerated = true;
      }
    } catch (err) {
      console.warn("[interview] AI question generation skipped:", err.message);
    }
  }

  if (!questions.length) {
    questions = Object.entries(FALLBACK_QUESTION_BANK).flatMap(([category, qs]) => qs.map((question) => ({ question, category })));
  }

  const interview = await Interview.create({
    studentId: req.user._id,
    targetRole: role,
    jobId: job?._id || null,
    interviewType,
    questions,
  });

  return success(res, { interview, aiGenerated }, 201);
});

/** Evaluate a single answer. Backend-computed structured scores only — no arbitrary AI final score. */
const answerQuestion = asyncHandler(async (req, res) => {
  const { questionIndex, answerText } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!interview) return fail(res, "Interview not found.", 404);

  const q = interview.questions[questionIndex];
  if (!q) return fail(res, "Invalid question index.", 400);

  let evaluation = null;
  if (aiService.isConfigured()) {
    try {
      evaluation = await aiService.evaluateInterviewAnswer({ question: q.question, answer: answerText, category: q.category });
    } catch (err) {
      console.warn("[interview] AI evaluation skipped:", err.message);
    }
  }

  if (!evaluation) {
    // Deterministic fallback: length/keyword-based heuristic, clearly weaker than AI eval but never fake-precise.
    const words = answerText.trim().split(/\s+/).filter(Boolean).length;
    const completenessScore = Math.min(100, Math.round((words / 80) * 100));
    evaluation = {
      technicalScore: completenessScore,
      relevanceScore: completenessScore,
      structureScore: completenessScore,
      completenessScore,
      feedback: "AI evaluation is not configured, so this is a basic length-based estimate. Configure AI_API_KEY for real feedback.",
      missingConcepts: [],
    };
  }

  const answerRecord = {
    questionIndex,
    answerText,
    scores: {
      technicalScore: evaluation.technicalScore ?? 0,
      relevanceScore: evaluation.relevanceScore ?? 0,
      structureScore: evaluation.structureScore ?? 0,
      completenessScore: evaluation.completenessScore ?? 0,
    },
    starAnalysis: evaluation.starAnalysis || undefined,
    feedback: evaluation.feedback || "",
    missingConcepts: evaluation.missingConcepts || [],
  };

  interview.answers = interview.answers.filter((a) => a.questionIndex !== questionIndex);
  interview.answers.push(answerRecord);
  await interview.save();

  return success(res, { answer: answerRecord });
});

/** Completes the interview: computes the final score deterministically from the per-answer scores already stored. */
const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!interview) return fail(res, "Interview not found.", 404);
  if (!interview.answers.length) return fail(res, "Answer at least one question before completing the interview.", 400);

  const avg = (key) => Math.round(interview.answers.reduce((s, a) => s + (a.scores[key] || 0), 0) / interview.answers.length);

  const breakdown = {
    technical: avg("technicalScore"),
    relevance: avg("relevanceScore"),
    structure: avg("structureScore"),
    completeness: avg("completenessScore"),
  };
  const finalScore = Math.round((breakdown.technical + breakdown.relevance + breakdown.structure + breakdown.completeness) / 4);

  interview.finalScore = finalScore;
  interview.scoreBreakdown = breakdown;
  interview.status = "completed";
  interview.completedAt = new Date();
  await interview.save();

  // Communication proxy = average of structure + relevance (used to feed the employability engine).
  const communicationProxy = Math.round((breakdown.structure + breakdown.relevance) / 2);

  await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { "componentScores.interview": finalScore, "componentScores.communication": communicationProxy } },
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
    interviewScore: finalScore,
  });

  notifyAndEmail({
    user: req.user,
    type: "interview-report",
    title: "Interview Report Ready",
    message: `Your interview score: ${finalScore}%`,
    link: `/interview-coach/${interview._id}/report`,
    emailPrefKey: "interviewReports",
    emailHtml: templates.interviewReport(finalScore, `${process.env.CLIENT_URL}/interview-coach/${interview._id}/report`),
    subject: "Your AI Interview Report is Ready",
  });

  return success(res, { interview, employabilityScore: updatedProfile.employabilityScore });
});

const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!interview) return fail(res, "Interview not found.", 404);
  return success(res, { interview });
});

const listInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ studentId: req.user._id }).sort({ createdAt: -1 });
  return success(res, { interviews });
});

module.exports = { generateInterview, answerQuestion, completeInterview, getInterview, listInterviews };
