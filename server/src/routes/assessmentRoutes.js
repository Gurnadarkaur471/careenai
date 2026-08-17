const router = require("express").Router();
const { listAssessments, getAssessment, submitAssessment, listResults } = require("../controllers/assessmentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.get("/results", listResults);
router.get("/", listAssessments);
router.get("/:id", getAssessment);
router.post("/:id/submit", submitAssessment);

module.exports = router;
