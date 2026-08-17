/**
 * DETERMINISTIC WHAT-IF CAREER SIMULATOR
 * Given the student's current component scores and a set of proposed
 * improvements, recompute the employability score using the SAME scoring
 * engine used everywhere else. The AI layer is only used afterwards to
 * narrate the result — never to invent the numbers.
 */
const { computeEmployabilityScore, clamp } = require("./scoringEngine");

/**
 * @param {Object} currentScores { technical, aptitude, resume, communication, interview }
 * @param {Array}  improvements [{ category: 'communication', delta: 15 }]
 * @param {String} targetRole
 */
function simulateImprovements(currentScores, improvements = [], targetRole = "Default") {
  const current = computeEmployabilityScore(currentScores, targetRole);

  const simulatedScores = { ...currentScores };
  const selectedImprovements = [];

  for (const imp of improvements) {
    const from = clamp(Number(simulatedScores[imp.category]) || 0);
    const to = clamp(from + Number(imp.delta || 0));
    simulatedScores[imp.category] = to;
    selectedImprovements.push({ category: imp.category, fromValue: from, toValue: to });
  }

  const simulated = computeEmployabilityScore(simulatedScores, targetRole);

  return {
    currentScore: current.overall,
    simulatedScore: simulated.overall,
    scoreDifference: Number((simulated.overall - current.overall).toFixed(2)),
    currentBreakdown: current.breakdown,
    simulatedBreakdown: simulated.breakdown,
    selectedImprovements,
  };
}

/**
 * Suggests which category improvements would close the gap to a target score,
 * ranked by "impact per point" (weight), so the highest-weight low-scoring
 * categories are suggested first. Purely arithmetic — no AI.
 */
function suggestImprovementPath(currentScores, weights, targetScore) {
  const categories = Object.keys(weights);
  const gaps = categories
    .map((cat) => ({
      category: cat,
      score: clamp(Number(currentScores[cat]) || 0),
      weight: weights[cat],
      headroom: 100 - clamp(Number(currentScores[cat]) || 0),
    }))
    .filter((c) => c.headroom > 0)
    .sort((a, b) => b.weight - a.weight || b.headroom - a.headroom);

  return gaps;
}

module.exports = { simulateImprovements, suggestImprovementPath };
