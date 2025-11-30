const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { generateAccessToken, hashToken } = require("../utils/jwt");

const authenticateToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token
      ? decodeURIComponent(req.cookies.token)
      : null;

    const headerToken = req.headers["authorization"]
      ? req.headers["authorization"].split(" ")[1]
      : null;

    const accessToken = cookieToken || headerToken;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        const [rows] = await db.query(
          "SELECT id, first_name, last_name, username, email, profile_image FROM users WHERE id = ?",
          [decoded.id]
        );

        if (rows.length === 0)
          return res.status(401).json({ message: "Unauthorized" });

        req.user = rows[0];
        return next();

      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(403).json({ message: "Invalid token" });
        }
      }
    }

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const tokenHash = hashToken(refreshToken);
    const [rows] = await db.query(
      "SELECT id FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW()",
      [tokenHash]
    );

    if (rows.length === 0)
      return res.status(403).json({ message: "Invalid or expired session" });

    const newAccessToken = generateAccessToken(payload);

    res.cookie("token", encodeURIComponent(newAccessToken), {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    const [userRows] = await db.query(
      "SELECT id, first_name, last_name, username, email, profile_image FROM users WHERE id = ?",
      [payload.id]
    );

    req.user = userRows[0];

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authenticateToken };