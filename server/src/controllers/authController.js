const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const asyncHandler = require("../utils/asyncHandler");
const { success, fail } = require("../utils/apiResponse");
const generateToken = require("../utils/generateToken");
const { notifyAndEmail, templates } = require("../services/notificationService");

const sanitizeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  college: u.college,
  course: u.course,
  branch: u.branch,
  semester: u.semester,
  avatarUrl: u.avatarUrl,
});

const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 400);

  const { name, email, password, college, course, branch, semester, targetRole, targetGoal } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return fail(res, "An account with this email already exists.", 409);

  const hashed = await bcrypt.hash(password, 10);

  // Students always default to STUDENT — role is never accepted from the public signup form.
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "STUDENT",
    college,
    course,
    branch,
    semester,
  });

  await StudentProfile.create({
    userId: user._id,
    college,
    course,
    branch,
    semester,
    targetRole: targetRole || "Software Developer",
    targetGoal: targetGoal || "Land my first job",
  });

  const token = generateToken(user);

  notifyAndEmail({
    user,
    type: "welcome",
    title: "Welcome to CareerAI",
    message: "Your account was created. Complete your profile to get started.",
    link: "/dashboard",
    emailHtml: templates.welcome(user.name, `${process.env.CLIENT_URL}/dashboard`),
    subject: "Welcome to CareerAI 🎓",
  });

  return success(res, { token, user: sanitizeUser(user) }, 201);
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 400);

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) return fail(res, "Invalid email or password.", 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) return fail(res, "Invalid email or password.", 401);

  const token = generateToken(user);
  return success(res, { token, user: sanitizeUser(user) });
});

const me = asyncHandler(async (req, res) => {
  return success(res, { user: sanitizeUser(req.user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always respond the same way to avoid leaking which emails are registered.
  if (!user) return success(res, { message: "If that email exists, a reset link has been sent." });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const { sendEmail, templates: t } = require("../services/emailService");
  sendEmail({ to: user.email, subject: "Password Reset Request", html: t.passwordReset(resetUrl) }).catch(() => {});

  return success(res, { message: "If that email exists, a reset link has been sent." });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    return fail(res, "A valid token and a password (min 6 chars) are required.", 400);
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) return fail(res, "This reset link is invalid or has expired.", 400);

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return success(res, { message: "Password updated. You can now log in." });
});

module.exports = { signup, login, me, forgotPassword, resetPassword, sanitizeUser };
