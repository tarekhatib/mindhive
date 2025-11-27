const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/api/auth/register", register);
router.post("/api/auth/login", login);
router.post("/api/auth/refresh", refresh);
router.post("/api/auth/logout", authenticateToken, logout);
router.get("/api/auth/me", authenticateToken, getCurrentUser);

module.exports = router;