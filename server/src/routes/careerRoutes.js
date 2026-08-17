const router = require("express").Router();
const { simulateCareer, listSimulations, generateRoadmap } = require("../controllers/careerController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");

router.use(authenticateUser, authorizeRoles("STUDENT"));
router.post("/simulate", simulateCareer);
router.get("/simulations", listSimulations);
router.get("/roadmap", generateRoadmap);

module.exports = router;
