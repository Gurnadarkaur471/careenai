/**
 * DETERMINISTIC JOB MATCHING ENGINE
 * Compares a student's skill set against a job's required/preferred skills.
 * Required skills carry more weight than preferred skills.
 */
const REQUIRED_WEIGHT = 0.75;
const PREFERRED_WEIGHT = 0.25;

function normalize(skill) {
  return String(skill).trim().toLowerCase();
}

function computeJobMatch(studentSkills = [], requiredSkills = [], preferredSkills = []) {
  const studentSet = new Set(studentSkills.map(normalize));

  const matchedRequired = requiredSkills.filter((s) => studentSet.has(normalize(s)));
  const missingRequired = requiredSkills.filter((s) => !studentSet.has(normalize(s)));
  const matchedPreferred = preferredSkills.filter((s) => studentSet.has(normalize(s)));

  const requiredScore = requiredSkills.length
    ? (matchedRequired.length / requiredSkills.length) * 100
    : 100;
  const preferredScore = preferredSkills.length
    ? (matchedPreferred.length / preferredSkills.length) * 100
    : 100;

  const matchScore = Math.round(requiredScore * REQUIRED_WEIGHT + preferredScore * PREFERRED_WEIGHT);

  return {
    matchScore,
    matchedSkills: matchedRequired,
    missingSkills: missingRequired,
    preferredSkillMatches: matchedPreferred,
    breakdown: {
      requiredMatched: `${matchedRequired.length}/${requiredSkills.length}`,
      preferredMatched: `${matchedPreferred.length}/${preferredSkills.length}`,
      requiredScore: Math.round(requiredScore),
      preferredScore: Math.round(preferredScore),
      formula: `(${Math.round(requiredScore)} × 75%) + (${Math.round(preferredScore)} × 25%)`,
    },
  };
}

/**
 * DETERMINISTIC SKILL-GAP ENGINE
 * Classifies each required skill as strong / needs-improvement / missing,
 * using assessment performance as a proxy for current level when available.
 */
function computeSkillGaps({ requiredSkills = [], studentSkills = [], topicPerformance = {} }, requiredLevel = 70) {
  const studentSet = new Set(studentSkills.map(normalize));

  return requiredSkills.map((skill) => {
    const has = studentSet.has(normalize(skill));
    const perf = topicPerformance[skill];
    const currentLevel = typeof perf === "number" ? perf : has ? 65 : 0;

    let status = "missing";
    if (currentLevel >= requiredLevel) status = "strong";
    else if (currentLevel > 0) status = "needs-improvement";

    let priority = "MEDIUM";
    if (status === "missing") priority = "HIGH";
    else if (status === "strong") priority = "LOW";

    return { skill, status, currentLevel, requiredLevel, priority };
  });
}

module.exports = { computeJobMatch, computeSkillGaps };
