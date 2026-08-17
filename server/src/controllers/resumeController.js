const path = require("path");
const Resume = require("../models/Resume");
const StudentProfile = require("../models/StudentProfile");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const { extractText, extractSkillsFromText, scoreResume } = require("../services/resumeParser");
const aiService = require("../services/aiService");
const { recomputeEmployabilityScore } = require("./studentController");
const { notifyAndEmail, templates } = require("../services/notificationService");
const Progress = require("../models/Progress");

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, "No file uploaded. Attach a PDF or DOCX resume.", 400);

  const resume = await Resume.create({
    studentId: req.user._id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: path.extname(req.file.originalname).toLowerCase(),
  });

  return success(res, { resume }, 201);
});

const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const resume = await Resume.findOne({ _id: resumeId, studentId: req.user._id });
  if (!resume) return fail(res, "Resume not found.", 404);

  const text = await extractText(resume.filePath);
  const deterministicSkills = extractSkillsFromText(text);
  const { resumeScore, analysis, sections } = scoreResume({ text, skills: deterministicSkills });

  resume.extractedText = text;
  resume.extractedSkills = deterministicSkills;
  resume.resumeScore = resumeScore;
  resume.analysis = { ...analysis, aiGenerated: false };

  // Layer AI enrichment on top when configured — never replaces the deterministic score.
  if (aiService.isConfigured()) {
    try {
      const aiResult = await aiService.analyzeResumeText(text);
      if (aiResult) {
        resume.extractedSkills = Array.from(new Set([...deterministicSkills, ...(aiResult.skills || [])]));
        resume.projects = aiResult.projects || [];
        resume.education = aiResult.education || [];
        resume.certifications = aiResult.certifications || [];
        resume.experience = aiResult.experience || [];
        resume.analysis.suggestions = aiResult.suggestions?.length ? aiResult.suggestions : resume.analysis.suggestions;
        resume.analysis.aiGenerated = true;
      }
    } catch (err) {
      // AI enrichment failing must not break the deterministic result.
      console.warn("[resume] AI enrichment skipped:", err.message);
    }
  }

  await resume.save();

  // Feed resume score + skills into the student's profile and recompute employability.
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        "componentScores.resume": resumeScore,
        skills: resume.extractedSkills,
      },
    },
    { new: true, upsert: true }
  );
  const updatedProfile = await recomputeEmployabilityScore(req.user._id);

  await Progress.create({
    studentId: req.user._id,
    employabilityScore: updatedProfile.employabilityScore,
    resumeScore,
    technicalScore: updatedProfile.componentScores.technical,
    aptitudeScore: updatedProfile.componentScores.aptitude,
    communicationScore: updatedProfile.componentScores.communication,
    interviewScore: updatedProfile.componentScores.interview,
  });

  notifyAndEmail({
    user: req.user,
    type: "resume-analysis",
    title: "Resume Analysis Ready",
    message: `Your resume scored ${resumeScore}%.`,
    link: "/resume-analyzer",
    emailPrefKey: "resumeAnalysis",
    emailHtml: templates.resumeAnalysis(resumeScore, analysis.suggestions?.[0], `${process.env.CLIENT_URL}/resume-analyzer`),
    subject: "Your Resume Analysis is Ready",
  });

  return success(res, { resume, employabilityScore: updatedProfile.employabilityScore });
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.resumeId, studentId: req.user._id });
  if (!resume) return fail(res, "Resume not found.", 404);
  return success(res, { resume });
});

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ studentId: req.user._id }).sort({ createdAt: -1 });
  return success(res, { resumes });
});

module.exports = { uploadResume, analyzeResume, getResume, listResumes };
