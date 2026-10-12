require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { seedDefaultAssessments } = require("./seed/seedQuestions");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await seedDefaultAssessments();

  const server = app.listen(PORT, () => {
    console.log(`[server] CareerAI API listening on http://localhost:${PORT}`);
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
