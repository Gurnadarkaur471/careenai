require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const mongoose = require("mongoose");

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@careerai.local";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] Admin already exists: ${email}`);
    return existing;
  }
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 10);
  const admin = await User.create({
    name: process.env.ADMIN_NAME || "Placement Admin",
    email,
    password: hashed,
    role: "ADMIN",
  });
  console.log(`[seed] Admin created: ${email} / (see ADMIN_PASSWORD in .env)`);
  return admin;
}

if (require.main === module) {
  (async () => {
    await connectDB();
    await ensureAdminUser();
    await mongoose.disconnect();
  })().catch((err) => {
    console.error("[seed] admin failed:", err.message);
    mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = { ensureAdminUser };

