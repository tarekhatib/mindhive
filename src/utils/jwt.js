const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
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
