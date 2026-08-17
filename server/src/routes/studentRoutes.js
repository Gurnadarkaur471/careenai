const router = require("express").Router();
const { getProfile, updateProfile, getDashboard } = require("../controllers/studentController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/dashboard", getDashboard);

module.exports = router;
