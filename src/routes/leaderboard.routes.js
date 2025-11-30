const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboard.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/leaderboard", authenticateToken, leaderboardController.getLeaderboardPage);
router.get("/leaderboard/api", authenticateToken, leaderboardController.getLeaderboardData);

module.exports = router;