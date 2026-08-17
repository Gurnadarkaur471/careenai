const router = require("express").Router();
const { uploadResume, analyzeResume, getResume, listResumes } = require("../controllers/resumeController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.post("/upload", upload.single("resume"), uploadResume);
router.post("/:resumeId/analyze", analyzeResume);
router.get("/:resumeId", getResume);
router.get("/", listResumes);

module.exports = router;
