const router = require("express").Router();
const { generateSkillGaps, listSkillGaps } = require("../controllers/skillGapController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.post("/gaps", generateSkillGaps);
router.get("/gaps", listSkillGaps);

module.exports = router;
