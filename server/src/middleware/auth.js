const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { fail } = require("../utils/apiResponse");

const authenticateUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (!token) return fail(res, "Not authenticated. Please log in.", 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return fail(res, "User no longer exists.", 401);

    req.user = user;
    next();
  } catch (err) {
    return fail(res, "Invalid or expired session. Please log in again.", 401);
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return fail(res, "You do not have permission to perform this action.", 403);
  }
  next();
};

module.exports = { authenticateUser, authorizeRoles };
