// Deterministic, role-specific weighting profiles for the employability engine.
// AI is never allowed to set or override these numbers.

const DEFAULT_WEIGHTS = {
  technical: 0.30,
  aptitude: 0.20,
  resume: 0.15,
  communication: 0.15,
  interview: 0.20,
};

const ROLE_WEIGHTS = {
  "Software Developer": { technical: 0.35, aptitude: 0.20, resume: 0.15, communication: 0.10, interview: 0.20 },
  "Data Analyst": { technical: 0.30, aptitude: 0.25, resume: 0.15, communication: 0.10, interview: 0.20 },
  "ML Engineer": { technical: 0.35, aptitude: 0.20, resume: 0.15, communication: 0.10, interview: 0.20 },
  "Default": DEFAULT_WEIGHTS,
};

const TECHNICAL_TOPIC_WEIGHTS = {
  "Software Developer": { DSA: 0.35, Programming: 0.30, DBMS: 0.20, SQL: 0.15 },
  "Data Analyst": { SQL: 0.35, Statistics: 0.30, Python: 0.20, DataVisualization: 0.15 },
  "Default": { DSA: 0.25, Programming: 0.25, DBMS: 0.25, SQL: 0.25 },
};

function getWeightsForRole(role) {
  return ROLE_WEIGHTS[role] || ROLE_WEIGHTS.Default;
}

function getTopicWeightsForRole(role) {
  return TECHNICAL_TOPIC_WEIGHTS[role] || TECHNICAL_TOPIC_WEIGHTS.Default;
}

module.exports = { DEFAULT_WEIGHTS, ROLE_WEIGHTS, getWeightsForRole, getTopicWeightsForRole };
