const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validateChangePassword,
  validateDeleteAccount,
} = require("../middleware/settings.middleware");
const {
  changePassword,
  deleteAccount,
  renderSettings,
} = require("../controllers/settings.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 */

/**
 * @swagger
 * /settings/update-password:
 *   patch:
 *     summary: Update user password
 *     tags: [Settings]
 */

router.get("/settings", authenticateToken, renderSettings);

router.post(
  "/api/settings/change-password",
  authenticateToken,
  validateChangePassword,
  changePassword
);

router.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
});

router.delete(
  "/api/settings/delete-account",
  authenticateToken,
  validateDeleteAccount,
  deleteAccount
);

module.exports = router;
