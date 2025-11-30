const { Router } = require("express");
const { sendTestEmail } = require("../controllers/emailTestController");

const router = Router();

// POST /api/test-email
router.post("/", sendTestEmail);

module.exports = router;
