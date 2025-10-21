const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../config/db");
const { generateAccessToken, hashToken } = require("../utils/jwt");

function authFail(req, res, status = 401, message = "Unauthorized") {
  if (req.accepts(["html", "json"]) === "html") return res.redirect("/login");
  return res.status(status).json({ message });
}

const authenticateToken = (req, res, next) => {
  const cookieToken = req.cookies?.token
    ? decodeURIComponent(req.cookies.token)
    : null;
  const headerToken = req.headers["authorization"]
    ? req.headers["authorization"].split(" ")[1]
    : null;
  const token = cookieToken || headerToken;

  const tryRefresh = () => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return authFail(req, res, 401, "Unauthorized");

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, payload) => {
      if (err) return authFail(req, res, 403, "Invalid or expired session");

      const tokenHash = hashToken(refreshToken);

      db
        .query(
          "SELECT id FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW()",
          [tokenHash]
        )
        .then(([rows]) => {
          if (!rows || rows.length === 0)
            return authFail(req, res, 403, "Invalid or expired session");

          const newAccessToken = generateAccessToken({
            id: payload.id,
            first_name: payload.first_name,
            last_name: payload.last_name,
            username: payload.username,
            email: payload.email,
          });

          res.cookie("token", encodeURIComponent(newAccessToken), {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
          });

          req.user = {
            id: payload.id,
            first_name: payload.first_name,
            last_name: payload.last_name,
            username: payload.username,
            email: payload.email,
          };
          next();
        })
        .catch(() => authFail(req, res, 500, "Server error"));
    });
  };

  if (!token) return tryRefresh();

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") return tryRefresh();
      return authFail(req, res, 403, "Invalid token");
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
