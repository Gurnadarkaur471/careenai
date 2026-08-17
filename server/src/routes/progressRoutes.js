const router = require("express").Router();
const { getProgress } = require("../controllers/progressController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.get("/", getProgress);

module.exports = router;
