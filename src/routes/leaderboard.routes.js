const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/leaderboard.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 */

/**
 * @swagger
 * /leaderboard/api:
 *   get:
 *     summary: Paginated leaderboard
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Leaderboard page }
 */

router.get(
  "/leaderboard",
  authenticateToken,
  leaderboardController.getLeaderboardPage
);
router.get(
  "/leaderboard/api",
  authenticateToken,
  leaderboardController.getLeaderboardData
);

module.exports = router;
