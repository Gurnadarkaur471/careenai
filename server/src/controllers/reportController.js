const Report = require("../models/Report");
const StudentProfile = require("../models/StudentProfile");
const Resume = require("../models/Resume");
const AssessmentResult = require("../models/AssessmentResult");
const JobMatch = require("../models/JobMatch");
const SkillGap = require("../models/SkillGap");
const CareerSimulation = require("../models/CareerSimulation");
const Interview = require("../models/Interview");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");

const generateReport = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const [profile, resumes, assessmentResults, jobMatches, skillGaps, simulations, interviews] = await Promise.all([
    StudentProfile.findOne({ userId: studentId }),
    Resume.find({ studentId }).sort({ createdAt: -1 }).limit(1),
    AssessmentResult.find({ studentId }).sort({ completedAt: -1 }).limit(10),
    JobMatch.find({ studentId }).sort({ createdAt: -1 }).limit(10),
    SkillGap.find({ studentId }),
    CareerSimulation.find({ studentId }).sort({ createdAt: -1 }).limit(5),
    Interview.find({ studentId, status: "completed" }).sort({ completedAt: -1 }).limit(5),
  ]);

  if (!profile) return fail(res, "Profile not found.", 404);

  const data = {
    profile,
    latestResume: resumes[0] || null,
    assessmentResults,
    jobMatches,
    skillGaps,
    simulations,
    interviews,
    generatedAt: new Date(),
  };

  const report = await Report.create({ studentId, reportType: "full", data });
  return success(res, { report });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, studentId: req.user._id });
  if (!report) return fail(res, "Report not found.", 404);
  return success(res, { report });
});

const listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ studentId: req.user._id }).sort({ generatedAt: -1 }).select("-data");
  return success(res, { reports });
});

module.exports = { generateReport, getReport, listReports };
