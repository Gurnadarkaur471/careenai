/**
 * DETERMINISTIC EMPLOYABILITY SCORING ENGINE
 * ---------------------------------------------
 * This is pure arithmetic. No AI/LLM call ever produces or adjusts these numbers.
 * AI is only used downstream to explain a score that this engine already computed.
 */
const { getWeightsForRole } = require("../config/scoringWeights");

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/**
 * @param {Object} scores { technical, aptitude, resume, communication, interview } each 0-100
 * @param {String} targetRole
 * @returns {{ overall: number, breakdown: object, weights: object }}
 */
function computeEmployabilityScore(scores, targetRole = "Default") {
  const weights = getWeightsForRole(targetRole);
  const categories = ["technical", "aptitude", "resume", "communication", "interview"];

  const breakdown = {};
  let overall = 0;

  for (const cat of categories) {
    const raw = clamp(Number(scores[cat]) || 0);
    const weight = weights[cat] ?? 0;
    const contribution = raw * weight;
    breakdown[cat] = {
      score: raw,
      weight,
      weightPercent: `${Math.round(weight * 100)}%`,
      contribution: Number(contribution.toFixed(2)),
      formula: `${raw} × ${Math.round(weight * 100)}%`,
    };
    overall += contribution;
  }

  overall = clamp(Number(overall.toFixed(2)));

  return { overall, breakdown, weights };
}

function findBiggestGap(scores) {
  const entries = Object.entries(scores || {});
  if (!entries.length) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0]; // category with the lowest score
}

function findStrongestSkill(skills = []) {
  return skills.length ? skills[0] : null;
}

module.exports = { computeEmployabilityScore, findBiggestGap, findStrongestSkill, clamp };
