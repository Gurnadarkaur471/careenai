const router = require("express").Router();
const { analyzeJobDescription, listJobs, getJob, createJob, matchJob, listMatches } = require("../controllers/jobController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.post("/analyze", analyzeJobDescription);
router.get("/matches", listMatches);
router.get("/", listJobs);
router.get("/:id", getJob);
router.post("/:id/match", matchJob);
router.post("/", createJob); // students can also add postings they found; admin pool uses /api/admin/jobs

module.exports = router;
