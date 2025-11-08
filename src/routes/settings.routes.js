const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validateChangePassword,
  validateDeleteAccount,
} = require("../middleware/settings.middleware");
const {
  changePassword,
  deleteAccount,
} = require("../controllers/settings.controller");

const router = express.Router();

router.post(
  "/api/settings/change-password",
  authenticateToken,
  validateChangePassword,
  changePassword
);

router.delete(
  "/api/settings/delete-account",
  authenticateToken,
  validateDeleteAccount,
  deleteAccount
);

module.exports = router;
