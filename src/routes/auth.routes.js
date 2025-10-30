const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/auth.controller.js");
const { authenticateToken } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/api/auth/me", authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ user: req.user });
});

module.exports = router;
