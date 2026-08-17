/**
 * EMAIL SERVICE ABSTRACTION LAYER
 * If EMAIL_PROVIDER is not set, emails are safely skipped and logged —
 * this must NEVER cause the calling operation (signup, assessment, etc.) to fail.
 */
const nodemailer = require("nodemailer");

let transporter = null;

function isConfigured() {
  return Boolean(process.env.EMAIL_PROVIDER && process.env.EMAIL_HOST && process.env.EMAIL_USER);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  return transporter;
}

function wrapTemplate(title, bodyHtml, ctaText, ctaLink) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color:#4f46e5;">CareerAI</h2>
    <h3>${title}</h3>
    <div style="color:#333; line-height:1.6;">${bodyHtml}</div>
    ${ctaLink ? `<p style="margin-top:24px;"><a href="${ctaLink}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">${ctaText}</a></p>` : ""}
    <hr style="margin-top:32px;border:none;border-top:1px solid #eee;" />
    <p style="font-size:12px;color:#999;">You're receiving this because you have a CareerAI account. Manage preferences in Settings.</p>
  </div>`;
}

/**
 * Sends an email. Never throws — logs failure and resolves { sent: boolean }.
 */
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] SKIPPED (not configured) -> to=${to} subject="${subject}"`);
    return { sent: false, reason: "not-configured" };
  }
  try {
    await t.sendMail({ from: process.env.EMAIL_FROM || "CareerAI <no-reply@careerai.local>", to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error(`[email] FAILED -> to=${to} subject="${subject}" error=${err.message}`);
    return { sent: false, reason: err.message };
  }
}

const templates = {
  welcome: (name, dashboardUrl) =>
    wrapTemplate("Welcome to CareerAI 🎓", `<p>Hello ${name},</p><p>Welcome to CareerAI. Start by completing your profile and uploading your resume to generate your employability profile.</p>`, "Go to Dashboard", dashboardUrl),

  passwordReset: (resetUrl) =>
    wrapTemplate("Password Reset Request", `<p>We received a request to reset your CareerAI password. This link expires in 1 hour.</p>`, "Reset Password", resetUrl),

  resumeAnalysis: (score, topSuggestion, viewUrl) =>
    wrapTemplate("Your Resume Analysis is Ready", `<p>Resume Score: <b>${score}%</b></p><p>Top improvement: ${topSuggestion || "N/A"}</p>`, "View Analysis", viewUrl),

  assessmentResult: (title, score, viewUrl) =>
    wrapTemplate("Assessment Completed", `<p>Assessment: <b>${title}</b></p><p>Score: <b>${score}%</b></p>`, "View Results", viewUrl),

  interviewReport: (score, viewUrl) =>
    wrapTemplate("Your AI Interview Report is Ready", `<p>Interview Score: <b>${score}%</b></p>`, "View Interview Report", viewUrl),

  simulationResult: (current, simulated, viewUrl) =>
    wrapTemplate("Your Career Simulation is Ready", `<p>Current Readiness: <b>${current}%</b></p><p>Simulated Readiness: <b>${simulated}%</b></p><p>Potential Improvement: <b>+${(simulated - current).toFixed(1)}%</b></p>`, "View Simulation", viewUrl),

  milestone: (previous, current) =>
    wrapTemplate("🎉 You improved your employability score!", `<p>Previous: ${previous}%</p><p>Current: ${current}%</p><p>Improvement: +${(current - previous).toFixed(1)}%</p>`),
};

module.exports = { sendEmail, templates, isConfigured };
