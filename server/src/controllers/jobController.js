const Job = require("../models/Job");
const JobMatch = require("../models/JobMatch");
const StudentProfile = require("../models/StudentProfile");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const { extractSkillsFromText } = require("../config/skillsDictionary");
const aiService = require("../services/aiService");
const { computeJobMatch } = require("../services/matchingEngine");

/** Analyze a pasted/uploaded job description. Uses AI when configured, deterministic keyword match as fallback. */
const analyzeJobDescription = asyncHandler(async (req, res) => {
  const { title, company, description, location, jobType } = req.body;
  if (!description || description.trim().length < 30) {
    return fail(res, "Please provide a fuller job description (at least 30 characters).", 400);
  }

  let requiredSkills = extractSkillsFromText(description);
  let preferredSkills = [];
  let education = "";
  let experience = "";
  let responsibilities = [];
  let aiUsed = false;

  if (aiService.isConfigured()) {
    try {
      const aiResult = await aiService.analyzeJobDescription(description);
      if (aiResult) {
        requiredSkills = aiResult.requiredSkills?.length ? aiResult.requiredSkills : requiredSkills;
        preferredSkills = aiResult.preferredSkills || [];
        education = aiResult.education || "";
        experience = aiResult.experience || "";
        responsibilities = aiResult.responsibilities || [];
        aiUsed = true;
      }
    } catch (err) {
      console.warn("[job] AI analysis skipped:", err.message);
    }
  }

  const job = await Job.create({
    title: title || "Untitled Role",
    company: company || "",
    description,
    requiredSkills,
    preferredSkills,
    education,
    experience,
    responsibilities,
    location: location || "",
    jobType: jobType || "Full-time",
    createdBy: req.user._id,
    source: "student-paste",
  });

  return success(res, { job, aiUsed }, 201);
});

const listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(100);
  return success(res, { jobs });
});

const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return fail(res, "Job not found.", 404);
  return success(res, { job });
});

/** Admin: create a canonical job posting used for the recommendation pool. */
const createJob = asyncHandler(async (req, res) => {
  const { title, company, description, requiredSkills = [], preferredSkills = [], education, experience, responsibilities = [], location, jobType } = req.body;
  const job = await Job.create({
    title, company, description, requiredSkills, preferredSkills, education, experience,
    responsibilities, location, jobType, createdBy: req.user._id, source: "admin",
  });
  return success(res, { job }, 201);
});

/** Deterministic job matching for the logged-in student against a specific job. */
const matchJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return fail(res, "Job not found.", 404);

  const profile = await StudentProfile.findOne({ userId: req.user._id });
  const studentSkills = profile?.skills || [];

  const { matchScore, matchedSkills, missingSkills, preferredSkillMatches, breakdown } = computeJobMatch(
    studentSkills, job.requiredSkills, job.preferredSkills
  );

  let explanation = `You match ${breakdown.requiredMatched} required skills and ${breakdown.preferredMatched} preferred skills for this role.`;
  if (aiService.isConfigured()) {
    try {
      explanation = await aiService.generateSkillGapExplanation(
        { matchScore, matchedSkills, missingSkills },
        job.title
      );
    } catch { /* keep deterministic fallback explanation */ }
  }

  const jobMatch = await JobMatch.create({
    studentId: req.user._id,
    jobId: job._id,
    matchScore,
    matchedSkills,
    missingSkills,
    preferredSkillMatches,
    explanation,
  });

  return success(res, { jobMatch, breakdown });
});

/** Ranks ALL jobs in the pool against the student — deterministic, no AI involved. */
const listMatches = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id });
  const studentSkills = profile?.skills || [];
  const jobs = await Job.find().limit(50);

  const ranked = jobs
    .map((job) => {
      const { matchScore, matchedSkills, missingSkills } = computeJobMatch(studentSkills, job.requiredSkills, job.preferredSkills);
      return { job, matchScore, matchedSkills, missingSkills };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return success(res, { matches: ranked });
});

module.exports = { analyzeJobDescription, listJobs, getJob, createJob, matchJob, listMatches };
