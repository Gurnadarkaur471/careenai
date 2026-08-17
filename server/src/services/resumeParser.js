/**
 * Extracts raw text from an uploaded resume file (PDF or DOCX),
 * then applies deterministic keyword-based skill extraction and
 * a deterministic completeness/relevance scoring pass.
 * AI enrichment (analyzeResumeText) is layered on top when configured.
 */
const fs = require("fs");
const path = require("path");
const { extractSkillsFromText } = require("../config/skillsDictionary");

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === ".pdf") {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (ext === ".docx") {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw new Error("Unsupported file type for extraction.");
}

const SECTION_KEYWORDS = {
  education: ["education", "b.tech", "bachelor", "university", "college", "degree"],
  experience: ["experience", "internship", "worked at", "employment"],
  projects: ["project", "projects"],
  certifications: ["certification", "certificate", "certified"],
  skills: ["skills", "technologies", "tech stack"],
};

function detectSections(text) {
  const lower = text.toLowerCase();
  const present = {};
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    present[section] = keywords.some((k) => lower.includes(k));
  }
  return present;
}

/**
 * Deterministic resume scoring — 0-100, based on measurable signals only.
 */
function scoreResume({ text, skills }) {
  const sections = detectSections(text);
  const sectionCount = Object.values(sections).filter(Boolean).length;
  const sectionCompleteness = Math.round((sectionCount / 5) * 100);

  const skillRelevance = Math.min(100, Math.round((skills.length / 12) * 100));

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const keywordCoverage = Math.min(100, Math.round((wordCount / 400) * 100));

  const projectRelevance = sections.projects ? 75 : 20;

  const completeness = Math.round(
    sectionCompleteness * 0.35 + skillRelevance * 0.3 + keywordCoverage * 0.2 + projectRelevance * 0.15
  );

  const suggestions = [];
  if (!sections.projects) suggestions.push("Add a dedicated Projects section with measurable outcomes.");
  if (!sections.certifications) suggestions.push("List relevant certifications to strengthen your profile.");
  if (skills.length < 8) suggestions.push("Include more specific technical skills and tools you've used.");
  if (wordCount < 250) suggestions.push("Your resume looks short — add more detail on responsibilities and impact.");

  return {
    resumeScore: Math.min(100, completeness),
    analysis: { completeness, skillRelevance, projectRelevance, keywordCoverage, sectionCompleteness, suggestions },
    sections,
  };
}

module.exports = { extractText, extractSkillsFromText, scoreResume, detectSections };
