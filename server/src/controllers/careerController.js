const StudentProfile = require("../models/StudentProfile");
const SkillGap = require("../models/SkillGap");
const CareerSimulation = require("../models/CareerSimulation");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const { simulateImprovements, suggestImprovementPath } = require("../services/simulationEngine");
const { getWeightsForRole } = require("../config/scoringWeights");
const aiService = require("../services/aiService");
const { notifyAndEmail, templates } = require("../services/notificationService");

/**
 * WHAT-IF CAREER SIMULATOR
 * body: { improvements: [{ category, delta }] }  OR  { targetScore: number } to auto-suggest a path.
 */
const simulateCareer = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile) return fail(res, "Complete your profile first.", 400);

  const currentScores = profile.componentScores.toObject ? profile.componentScores.toObject() : profile.componentScores;
  const weights = getWeightsForRole(profile.targetRole);

  let improvements = req.body.improvements || [];

  // If the student instead asked "what should I improve to reach X%", auto-build a suggested improvement set.
  if (!improvements.length && req.body.targetScore) {
    const path = suggestImprovementPath(currentScores, weights, req.body.targetScore);
    improvements = path.slice(0, 3).map((p) => ({ category: p.category, delta: Math.min(20, p.headroom) }));
  }

  if (!improvements.length) return fail(res, "Provide at least one improvement, or a targetScore to auto-suggest one.", 400);

  const result = simulateImprovements(currentScores, improvements, profile.targetRole);

  let explanation = `Prioritizing ${improvements.map((i) => i.category).join(", ")} raises your score from ${result.currentScore}% to ${result.simulatedScore}% because these categories carry the highest weight relative to their current gap.`;
  if (aiService.isConfigured()) {
    try {
      explanation = await aiService.generateSimulationExplanation(result, profile.targetRole);
    } catch { /* deterministic fallback explanation stands */ }
  }

  const simulation = await CareerSimulation.create({
    studentId: req.user._id,
    currentScore: result.currentScore,
    targetScore: req.body.targetScore || null,
    selectedImprovements: result.selectedImprovements,
    simulatedScore: result.simulatedScore,
    scoreDifference: result.scoreDifference,
    calculationBreakdown: { currentBreakdown: result.currentBreakdown, simulatedBreakdown: result.simulatedBreakdown },
    explanation,
  });

  notifyAndEmail({
    user: req.user,
    type: "career-simulation",
    title: "Career Simulation Ready",
    message: `Simulated readiness: ${result.simulatedScore}% (from ${result.currentScore}%).`,
    link: "/career-simulator",
    emailPrefKey: "careerProgress",
    emailHtml: templates.simulationResult(result.currentScore, result.simulatedScore, `${process.env.CLIENT_URL}/career-simulator`),
    subject: "Your Career Simulation is Ready",
  });

  return success(res, { simulation });
});

const listSimulations = asyncHandler(async (req, res) => {
  const simulations = await CareerSimulation.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  return success(res, { simulations });
});

/** Roadmap generation: AI narrates a plan, but it must be anchored to the skill gaps we already computed. */
const generateRoadmap = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile) return fail(res, "Complete your profile first.", 400);

  const skillGaps = await SkillGap.find({ studentId: req.user._id, targetRole: profile.targetRole }).sort({ priority: 1 });
  if (!skillGaps.length) return fail(res, "Generate your skill gaps first (POST /api/skills/gaps).", 400);

  if (!aiService.isConfigured()) {
    // Deterministic fallback roadmap: one skill gap per week, highest priority first.
    const weeks = skillGaps.slice(0, 5).map((g, i) => ({
      week: i + 1,
      focus: g.skill,
      tasks: [`Study core concepts of ${g.skill}`, `Build a small project using ${g.skill}`, `Practice ${g.skill} interview questions`],
    }));
    return success(res, { roadmap: { weeks }, aiGenerated: false });
  }

  try {
    const roadmap = await aiService.generateCareerRoadmap({ targetRole: profile.targetRole, skillGaps, weeks: 5 });
    return success(res, { roadmap, aiGenerated: true });
  } catch (err) {
    return fail(res, err.message, 503);
  }
});

module.exports = { simulateCareer, listSimulations, generateRoadmap };
