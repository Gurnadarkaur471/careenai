const SkillGap = require("../models/SkillGap");
const StudentProfile = require("../models/StudentProfile");
const AssessmentResult = require("../models/AssessmentResult");
const Job = require("../models/Job");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const { computeSkillGaps } = require("../services/matchingEngine");
const aiService = require("../services/aiService");

/** Generates skill gaps for the student's target role using their latest job match pool + assessment topic performance. */
const generateSkillGaps = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  if (!profile) return fail(res, "Complete your profile first.", 400);

  const targetRole = req.body.targetRole || profile.targetRole || "Software Developer";

  // Pull required skills from the best-matching job(s) in the pool for this role, or fall back to a role default set.
  const roleJobs = await Job.find({ title: new RegExp(targetRole, "i") }).limit(5);
  const requiredSkillsSet = new Set();
  roleJobs.forEach((j) => j.requiredSkills.forEach((s) => requiredSkillsSet.add(s)));
  if (requiredSkillsSet.size === 0) {
    ["DSA", "Programming", "SQL", "Git", "Communication"].forEach((s) => requiredSkillsSet.add(s));
  }

  const latestResults = await AssessmentResult.find({ studentId: req.user._id }).sort({ completedAt: -1 }).limit(5);
  const topicPerformance = {};
  latestResults.forEach((r) => Object.assign(topicPerformance, r.topicPerformance));

  const gaps = computeSkillGaps(
    { requiredSkills: Array.from(requiredSkillsSet), studentSkills: profile.skills, topicPerformance },
    70
  );

  let aiExplanation = null;
  if (aiService.isConfigured()) {
    try {
      aiExplanation = await aiService.generateSkillGapExplanation(gaps, targetRole);
    } catch { /* deterministic result still returned */ }
  }

  await SkillGap.deleteMany({ studentId: req.user._id, targetRole });
  const saved = await SkillGap.insertMany(
    gaps.map((g) => ({
      studentId: req.user._id,
      targetRole,
      skill: g.skill,
      status: g.status,
      currentLevel: g.currentLevel,
      requiredLevel: g.requiredLevel,
      priority: g.priority,
      reason: `${g.skill} is required for ${targetRole}.`,
      recommendation: g.status === "missing" ? `Start learning ${g.skill}.` : `Continue practicing ${g.skill} to reach ${g.requiredLevel}%.`,
    }))
  );

  return success(res, { skillGaps: saved, aiExplanation });
});

const listSkillGaps = asyncHandler(async (req, res) => {
  const filter = { studentId: req.user._id };
  if (req.query.targetRole) filter.targetRole = req.query.targetRole;
  const gaps = await SkillGap.find(filter).sort({ priority: 1 });
  return success(res, { skillGaps: gaps });
});

module.exports = { generateSkillGaps, listSkillGaps };
