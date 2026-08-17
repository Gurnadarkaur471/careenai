const router = require("express").Router();
const { signup, login, me, forgotPassword, resetPassword } = require("../controllers/authController");
const { signupValidator, loginValidator } = require("../validators/authValidators");
const { authenticateUser } = require("../middleware/auth");

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.get("/me", authenticateUser, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
