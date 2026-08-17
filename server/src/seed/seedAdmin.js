require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const mongoose = require("mongoose");

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || "admin@careerai.local";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] Admin already exists: ${email}`);
  } else {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 10);
    await User.create({
      name: process.env.ADMIN_NAME || "Placement Admin",
      email,
      password: hashed,
      role: "ADMIN",
    });
    console.log(`[seed] Admin created: ${email} / (see ADMIN_PASSWORD in .env)`);
  }
  await mongoose.disconnect();
})();
