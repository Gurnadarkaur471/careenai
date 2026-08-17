const router = require("express").Router();
const { listNotifications, markRead, markAllRead } = require("../controllers/notificationController");
const { authenticateUser } = require("../middleware/auth");

router.use(authenticateUser);
router.get("/", listNotifications);
router.patch("/:id/read", markRead);
router.patch("/read-all", markAllRead);

module.exports = router;
