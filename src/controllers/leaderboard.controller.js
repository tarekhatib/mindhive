const leaderboardService = require("../services/leaderboard.service");

const getLeaderboardPage = async (req, res) => {
  try {
    const page = 1;

    const data = await leaderboardService.getLeaderboardPage(page);

    res.render("leaderboard", {
      user: req.user,
      users: data.users,
      page,
      totalPages: Math.ceil(data.totalUsers / 50),
    });
  } catch (err) {
    console.error("Leaderboard render error:", err);
    res.status(500).send("Error loading leaderboard page");
  }
};

const getLeaderboardData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const data = await leaderboardService.getLeaderboardPage(page);

    res.json({
      success: true,
      page,
      users: data.users,
      totalUsers: data.totalUsers,
      totalPages: Math.ceil(data.totalUsers / 50),
    });
  } catch (err) {
    console.error("Leaderboard API error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot load leaderboard" });
  }
};

module.exports = {
  getLeaderboardPage,
  getLeaderboardData,
};
