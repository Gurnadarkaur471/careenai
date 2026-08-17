const router = require("express").Router();
const { generateInterview, answerQuestion, completeInterview, getInterview, listInterviews } = require("../controllers/interviewController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.post("/generate", generateInterview);
router.get("/", listInterviews);
router.get("/:id", getInterview);
router.post("/:id/answer", answerQuestion);
router.post("/:id/complete", completeInterview);

module.exports = router;
