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

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;