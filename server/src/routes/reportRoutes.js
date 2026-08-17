const router = require("express").Router();
const { generateReport, getReport, listReports } = require("../controllers/reportController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.post("/generate", generateReport);
router.get("/", listReports);
router.get("/:id", getReport);

module.exports = router;
