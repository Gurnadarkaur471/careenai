/**
 * AI SERVICE ABSTRACTION LAYER
 * -----------------------------------------------------------------------
 * Every AI/LLM call in the application goes through this file so the app
 * is not tightly coupled to one provider. Configure via .env:
 *   AI_API_KEY, AI_API_URL, AI_MODEL
 *
 * IMPORTANT: if AI_API_KEY is not set, functions throw AIServiceUnavailable
 * rather than returning fabricated data. Controllers catch this and fall
 * back to the deterministic-only parts of the feature, with a clear
 * message to the user — never a fake AI response.
 */
const https = require("https");

class AIServiceUnavailable extends Error {
  constructor(message = "AI service is not configured. Set AI_API_KEY in the server .env file.") {
    super(message);
    this.statusCode = 503;
  }
}

function isConfigured() {
  // Consider the AI service configured when either an API key or a custom
  // AI_API_URL is provided. This allows using a local model server without
  // an API key (common for portable local deployments like text-generation-webui).
  return Boolean(process.env.AI_API_KEY || process.env.AI_API_URL);
}

async function callAI(prompt, { maxTokens = 1024, system = null } = {}) {
  if (!isConfigured()) throw new AIServiceUnavailable();

  const baseUrl = process.env.AI_API_URL || "https://api.anthropic.com/v1/messages";

  const defaultModel = process.env.AI_MODEL || null;
  const fallbackModel = process.env.AI_FALLBACK_MODEL || null;

  if (!defaultModel && !fallbackModel) {
    throw new Error("No AI model configured. Set AI_MODEL or AI_FALLBACK_MODEL in your .env to a provider-supported model id.");
  }

  // Determine endpoint: if user provided a base /v1 URL (text-gen webui default),
  // call the chat completions endpoint. If they provided a full messages endpoint
  // (Anthropic), use it as-is.
  let endpoint = baseUrl;
  try {
    const cleaned = baseUrl.replace(/\/+$/, "");
    if (/\/v1$/.test(cleaned)) {
      endpoint = `${cleaned}/chat/completions`;
    }
  } catch (e) {
    endpoint = baseUrl;
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.AI_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.AI_API_KEY}`;
    headers["x-api-key"] = process.env.AI_API_KEY;
  }

  // Try the configured model, then optionally a fallback model if the provider
  // reports the model is unavailable. This makes local and provider-based
  // deployments more resilient when a model name is incorrect or inaccessible.
  const modelsToTry = Array.from(new Set([defaultModel, fallbackModel].filter(Boolean)));

  for (let idx = 0; idx < modelsToTry.length; idx++) {
    const model = modelsToTry[idx];

    const body = JSON.stringify({
      model,
      messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }],
      max_tokens: maxTokens,
    });

    const res = await fetch(endpoint, { method: "POST", headers, body });
    const rawText = await res.text().catch(() => "");

    if (!res.ok) {
        // Try to parse a JSON error body the provider may return.
        let parsedBody = null;
        try {
          parsedBody = JSON.parse(rawText || "null");
        } catch {
          parsedBody = null;
        }

        const lowered = (rawText || "").toLowerCase();
        const modelNotFound =
          (parsedBody && (parsedBody?.error?.code === "model_not_found" || parsedBody?.error?.message?.toLowerCase()?.includes("model not found"))) ||
          lowered.includes("model_not_found") ||
          lowered.includes("model not found") ||
          lowered.includes("does not exist");

        if (modelNotFound && idx < modelsToTry.length - 1) {
          console.warn(`AI model \"${model}\" not available; retrying with fallback \"${modelsToTry[idx + 1]}\".`);
          // try next model in the loop
          continue;
        }

        const providerMessage = (parsedBody && (parsedBody.error?.message || parsedBody.message)) || rawText || `status:${res.status}`;
        const err = new Error(`AI provider error (${res.status}): ${providerMessage.slice(0, 1000)}`);
        // surface provider error details for upstream handling
        err.statusCode = res.status;
        if (parsedBody && parsedBody.error) err.providerError = parsedBody.error;
        if (parsedBody && parsedBody.code) err.providerCode = parsedBody.code;
        // map common provider error codes
        if (err.providerError?.code) err.providerCode = err.providerError.code;
        throw err;
    }

    let data = {};
    try {
      data = JSON.parse(rawText || "{}");
    } catch {
      data = {};
    }

  // Normalize response from multiple provider styles (OpenAI/TextGen/Anthropic).
  const textResponse =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    (Array.isArray(data?.content) && data.content.map((c) => c.text).join("\n")) ||
    data?.output?.[0]?.content?.[0]?.text ||
    "";

    return textResponse;
    }

  // If we exhausted the candidate models without a successful response,
  // surface a clear error to the caller.
  throw new Error("AI provider did not return a successful response for any configured model.");
}

function parseJSONSafely(raw, fallback = null) {
  try {
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

// ---- Feature-level functions -------------------------------------------

async function analyzeResumeText(resumeText) {
  const system =
    "You extract structured data from resumes. Respond ONLY with valid JSON, no preamble, no markdown fences. " +
    'Schema: {"skills":[string],"softSkills":[string],"projects":[{"title":string,"description":string}],' +
    '"certifications":[{"name":string}],"education":[{"degree":string,"institution":string}],' +
    '"experience":[{"role":string,"company":string}],"suggestions":[string]}';
  const raw = await callAI(`Resume text:\n${resumeText.slice(0, 8000)}`, { system, maxTokens: 1200 });
  return parseJSONSafely(raw, null);
}

async function analyzeJobDescription(jdText) {
  const system =
    "You extract structured requirements from a job description. Respond ONLY with valid JSON. " +
    'Schema: {"requiredSkills":[string],"preferredSkills":[string],"education":string,"experience":string,' +
    '"responsibilities":[string]}';
  const raw = await callAI(`Job description:\n${jdText.slice(0, 8000)}`, { system, maxTokens: 800 });
  return parseJSONSafely(raw, null);
}

async function generateSkillGapExplanation(gaps, targetRole) {
  const system = "You are a career coach. Explain skill gaps concisely and encouragingly in 3-5 sentences, plain text only.";
  const prompt = `Target role: ${targetRole}\nSkill gaps (already computed, do not change any numbers): ${JSON.stringify(gaps)}`;
  return callAI(prompt, { system, maxTokens: 400 });
}

async function generateCareerRoadmap({ targetRole, skillGaps, weeks = 5 }) {
  const system =
    'Generate a week-by-week learning roadmap. Respond ONLY with JSON: {"weeks":[{"week":number,"focus":string,"tasks":[string]}]}';
  const prompt = `Target role: ${targetRole}\nSkill gaps: ${JSON.stringify(skillGaps)}\nNumber of weeks: ${weeks}`;
  const raw = await callAI(prompt, { system, maxTokens: 900 });
  return parseJSONSafely(raw, null);
}

async function generateInterviewQuestions({ resumeSummary, targetRole, jobDescription, projects }) {
  const system =
    'Generate interview questions. Respond ONLY with JSON: {"questions":[{"question":string,' +
    '"category":"Introduction"|"Technical"|"Resume"|"Project"|"HR"|"Behavioral"}]} — include 6-10 questions covering all categories.';
  const prompt = `Target role: ${targetRole}\nResume summary: ${resumeSummary || "N/A"}\nProjects: ${JSON.stringify(
    projects || []
  )}\nJob description: ${jobDescription || "N/A"}`;
  const raw = await callAI(prompt, { system, maxTokens: 900 });
  return parseJSONSafely(raw, null);
}

async function evaluateInterviewAnswer({ question, answer, category }) {
  const system =
    "You evaluate a candidate's spoken/written interview answer. Respond ONLY with JSON: " +
    '{"technicalScore":0-100,"relevanceScore":0-100,"structureScore":0-100,"completenessScore":0-100,' +
    '"feedback":string,"missingConcepts":[string]' +
    (category === "Behavioral" ? ',"starAnalysis":{"situation":bool,"task":bool,"action":bool,"result":bool}' : "") +
    "}";
  const prompt = `Question (${category}): ${question}\nCandidate answer: ${answer}`;
  const raw = await callAI(prompt, { system, maxTokens: 500 });
  return parseJSONSafely(raw, null);
}

async function generateSimulationExplanation(simulation, targetRole) {
  const system = "You are a career coach. Explain, in 2-4 sentences, why these improvements were prioritized, given their weight in the score formula. Do not invent numbers.";
  const prompt = `Target role: ${targetRole}\nSimulation result (already computed): ${JSON.stringify(simulation)}`;
  return callAI(prompt, { system, maxTokens: 350 });
}

module.exports = {
  AIServiceUnavailable,
  isConfigured,
  analyzeResumeText,
  analyzeJobDescription,
  generateSkillGapExplanation,
  generateCareerRoadmap,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateSimulationExplanation,
};
