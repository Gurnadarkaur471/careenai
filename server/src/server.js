const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = require("./app");
const connectDB = require("./config/db");
const { seedDefaultAssessments, seedJobs } = require("./seed/seedQuestions");
const { ensureAdminUser } = require("./seed/seedAdmin");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  
  // Ensure seed data is always ready without requiring manual shell access
  try {
    await seedDefaultAssessments();
    await seedJobs();
    await ensureAdminUser();
  } catch (seedErr) {
    console.warn("[server] seed step warning:", seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] CareerAI API listening on port ${PORT}`);
    console.log(`[server] Environment: ${process.env.NODE_ENV || "development"}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[server] port ${PORT} is already in use. Please stop the process using this port or set PORT to a different value.`);
      process.exit(1);
    }

    console.error("[server] unexpected error:", err.message);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error("[server] failed to start:", err.message);
  process.exit(1);
});
