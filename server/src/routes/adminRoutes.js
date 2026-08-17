const router = require("express").Router();
const {
  getDashboard, listStudents, getStudentDetail, createQuestion, createAssessment, listAllJobsAdmin,
} = require("../controllers/adminController");
const { createJob } = require("../controllers/jobController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("ADMIN"));
router.get("/dashboard", getDashboard);
router.get("/students", listStudents);
router.get("/students/:id", getStudentDetail);
router.post("/questions", createQuestion);
router.post("/assessments", createAssessment);
router.get("/jobs", listAllJobsAdmin);
router.post("/jobs", createJob);

module.exports = router;
