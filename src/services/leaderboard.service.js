const db = require("../config/db");
const getRankBySessions = require("../utils/getRank");

module.exports = {
  getLeaderboardPage: async (page = 1) => {
    const limit = 50;
    const offset = (page - 1) * limit;

    const [users] = await db.query(
      `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        u.profile_image,
        COALESCE(SUM(p.points), 0) AS total_points,
        COUNT(p.id) AS total_sessions,
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(p.points), 0) DESC) AS position
      FROM users u
      LEFT JOIN pomodoro_sessions p
        ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY total_points DESC
      LIMIT ? OFFSET ?;
      `,
      [limit, offset]
    );

    const [[countRow]] = await db.query(`
      SELECT COUNT(*) AS total FROM users;
    `);

    return {
      users,
      totalUsers: countRow.total
    };
  }
};