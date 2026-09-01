const StudentProfile = require("../models/StudentProfile");
const { computeEmployabilityScore, findBiggestGap } = require("../services/scoringEngine");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");

const getProfile = asyncHandler(async (req, res) => {
  let profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile) profile = await StudentProfile.create({ userId: req.user._id });
  return success(res, { profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "college", "course", "branch", "semester", "academicPerformance",
    "skills", "softSkills", "certifications", "projects", "experience",
    "targetRole", "targetGoal", "careerInterests",
  ];
  const updates = {};
  for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

  let profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { new: true, upsert: true }
  );

  return success(res, { profile });
});

/** Recomputes and persists the deterministic employability score for the student. */
const recomputeEmployabilityScore = async (userId) => {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) return null;

  const { overall, breakdown } = computeEmployabilityScore(profile.componentScores, profile.targetRole);
  profile.employabilityScore = overall;
  profile.scoreBreakdown = breakdown;
  await profile.save();
  return profile;
};

const getDashboard = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile) return fail(res, "Profile not found.", 404);

  const targetGoal = profile.targetGoal || "Land my first job";
  const biggestGap = findBiggestGap(profile.componentScores.toObject ? profile.componentScores.toObject() : profile.componentScores);
  const strongestSkill = profile.skills?.[0] || null;

  return success(res, {
    employabilityScore: profile.employabilityScore,
    scoreBreakdown: profile.scoreBreakdown,
    componentScores: profile.componentScores,
    targetRole: profile.targetRole,
    targetGoal,
    biggestGap,
    strongestSkill,
    recommendedAction: biggestGap
      ? `Improving your ${biggestGap} score will have the biggest impact on your employability right now.`
      : `Complete your profile and take an assessment to get recommendations for your goal: ${targetGoal}.`,
  });
});

module.exports = { getProfile, updateProfile, getDashboard, recomputeEmployabilityScore };
