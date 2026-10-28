const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const jobRoutes = require("./routes/jobRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const careerRoutes = require("./routes/careerRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const progressRoutes = require("./routes/progressRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const rawAllowed = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : []),
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
].filter(Boolean);

const allowedOrigins = rawAllowed.map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "CareerAI API is running", timestamp: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/skills", skillGapRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Static frontend serving if client is built alongside server
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "CareerAI API is running",
      status: "operational",
      healthCheck: "/api/health",
      version: "1.0.0",
    });
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
