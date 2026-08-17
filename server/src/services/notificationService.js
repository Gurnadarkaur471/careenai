/**
 * Central place that creates in-app notifications and (optionally) triggers
 * emails. Controllers call this instead of touching Notification/emailService
 * directly, per the required Controller -> Service -> Email/Notification flow.
 */
const Notification = require("../models/Notification");
const { sendEmail, templates } = require("./emailService");

async function notify({ userId, type, title, message, link = "" }) {
  try {
    await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    console.error("[notification] failed to create:", err.message);
  }
}

async function notifyAndEmail({ user, type, title, message, link, emailPrefKey, emailHtml, subject }) {
  await notify({ userId: user._id, type, title, message, link });

  const prefsAllow = !emailPrefKey || user.emailPreferences?.[emailPrefKey] !== false;
  if (emailHtml && prefsAllow) {
    // fire-and-forget; failures are logged inside sendEmail and never throw
    sendEmail({ to: user.email, subject, html: emailHtml }).catch(() => {});
  }
}

module.exports = { notify, notifyAndEmail, templates };
