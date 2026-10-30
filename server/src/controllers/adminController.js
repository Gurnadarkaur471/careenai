const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const AssessmentResult = require("../models/AssessmentResult");
const SkillGap = require("../models/SkillGap");
const JobMatch = require("../models/JobMatch");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const Assessment = require("../models/Assessment");
const Job = require("../models/Job");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");

const getDashboard = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: "STUDENT" });
  const profiles = await StudentProfile.find();

  const avg = (arr, key) => (arr.length ? Math.round(arr.reduce((s, p) => s + (p?.[key] || 0), 0) / arr.length) : 0);
  const avgEmployability = avg(profiles, "employabilityScore");
  const avgTechnical = avg(profiles.map((p) => p.componentScores || {}), "technical");
  const avgResume = avg(profiles.map((p) => p.componentScores || {}), "resume");
  const avgCommunication = avg(profiles.map((p) => p.componentScores || {}), "communication");
  const avgInterview = avg(profiles.map((p) => p.componentScores || {}), "interview");

  const readyForPlacement = profiles.filter((p) => p.employabilityScore >= 75).length;
  const needsImprovement = profiles.filter((p) => p.employabilityScore < 50).length;

  // Most common skill gap across all students (by count of "missing"/"needs-improvement" entries).
  const skillGapAgg = await SkillGap.aggregate([
    { $match: { status: { $in: ["missing", "needs-improvement"] } } },
    { $group: { _id: "$skill", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const branchAgg = await StudentProfile.aggregate([
    { $group: { _id: "$branch", avgScore: { $avg: "$employabilityScore" }, count: { $sum: 1 } } },
    { $sort: { avgScore: -1 } },
  ]);

  return success(res, {
    totalStudents,
    avgEmployability,
    avgTechnical,
    avgResume,
    avgCommunication,
    avgInterview,
    readyForPlacement,
    needsImprovement,
    topSkillGaps: skillGapAgg.map((s) => ({ skill: s._id, count: s.count })),
    branchWiseReadiness: branchAgg.map((b) => ({ branch: b._id || "Unspecified", avgScore: Math.round(b.avgScore || 0), count: b.count })),
  });
});

const listStudents = asyncHandler(async (req, res) => {
  const { branch, semester, minScore, search } = req.query;
  const userFilter = { role: "STUDENT" };
  if (typeof search === "string" && search.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    userFilter.$or = [{ name: new RegExp(escapedSearch, "i") }, { email: new RegExp(escapedSearch, "i") }];
  }

  const users = await User.find(userFilter).select("name email college course branch semester createdAt");
  const userIds = users.map((u) => u._id);

  const profileFilter = { userId: { $in: userIds } };
  const profiles = await StudentProfile.find(profileFilter);
  const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

  const students = users
    .map((user) => {
      const profile = profileMap.get(String(user._id)) || null;
      return { user, profile };
    })
    .filter(({ user, profile }) => {
      if (branch && (profile?.branch || user.branch) !== branch) return false;
      if (semester && (profile?.semester || user.semester) !== semester) return false;
      if (minScore && (profile?.employabilityScore ?? 0) < Number(minScore)) return false;
      return true;
    });

  return success(res, { students });
});

const getStudentDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return fail(res, "Student not found.", 404);
  const profile = await StudentProfile.findOne({ userId: user._id });
  const assessmentResults = await AssessmentResult.find({ studentId: user._id }).sort({ completedAt: -1 }).limit(10);
  const skillGaps = await SkillGap.find({ studentId: user._id });
  const jobMatches = await JobMatch.find({ studentId: user._id }).sort({ createdAt: -1 }).limit(10);
  const interviews = await Interview.find({ studentId: user._id, status: "completed" }).sort({ completedAt: -1 }).limit(5);

  return success(res, { user, profile, assessmentResults, skillGaps, jobMatches, interviews });
});

// ---- Assessment management ----
const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);
  return success(res, { question }, 201);
});

const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.create(req.body);
  return success(res, { assessment }, 201);
});

const listAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  return success(res, { jobs });
});

module.exports = { getDashboard, listStudents, getStudentDetail, createQuestion, createAssessment, listAllJobsAdmin };
