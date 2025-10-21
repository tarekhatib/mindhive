const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh
      ? process.env.JWT_REFRESH_SECRET
      : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
@@
// Utility used to store/compare refresh tokens securely in DB
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashToken,
};
