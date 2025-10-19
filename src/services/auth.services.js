const bcrypt = require("bcryptjs");
const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.js");

const registerUser = async ({
  first_name,
  last_name,
  username,
  email,
  password,
}) => {
  if (!first_name || !last_name || !username || !email || !password)
    throw { status: 400, message: "All fields required." };

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, username, email, hashedPassword]
    );
    return { message: "User registered successfully." };
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw { status: 409, message: "Username or email already exists." };
    }
    throw { status: 500, message: "Database error", error: err };
  }
};

const loginUser = async ({ identifier, password }) => {
  if (!identifier || !password)
    throw { status: 400, message: "Missing credentials." };

  try {
    const [results] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [identifier, identifier]
    );
    if (!results || results.length === 0)
      throw { status: 401, message: "Invalid username/email or password" };

    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid)
      throw { status: 401, message: "Invalid username/email or password" };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // store refresh token in DB (best-effort)
    try {
      await db.query(
        "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
        [user.id, refreshToken]
      );
    } catch (e) {
      // non-fatal: log and continue
      // console.error('Failed to store refresh token', e);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
      },
    };
  } catch (err) {
    if (err && err.status) throw err;
    throw { status: 500, message: "Database error", error: err };
  }
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "No refresh token provided." };

  try {
    // verify token signature/expiration
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // ensure token exists in DB
    try {
      const [rows] = await db.query(
        "SELECT * FROM refresh_tokens WHERE token = ?",
        [refreshToken]
      );
      if (!rows || rows.length === 0)
        throw { status: 403, message: "Invalid refresh token" };
    } catch (e) {
      if (e && e.status) throw e;
      throw { status: 500, message: "Database error", error: e };
    }

    const { password_hash, ...userData } = payload;
    const accessToken = generateAccessToken(userData);
    return { accessToken };
  } catch (err) {
    if (err && err.name === "TokenExpiredError")
      throw { status: 403, message: "Invalid or expired refresh token." };
    if (err && err.status) throw err;
    throw {
      status: 403,
      message: "Invalid or expired refresh token.",
      error: err,
    };
  }
};

const logoutUser = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "No refresh token provided." };

  try {
    const [result] = await db.query(
      "DELETE FROM refresh_tokens WHERE token = ?",
      [refreshToken]
    );
    if (result.affectedRows === 0)
      throw { status: 404, message: "Token not found." };
    return { message: "Logged out successfully." };
  } catch (err) {
    if (err && err.status) throw err;
    throw { status: 500, message: "Database error", error: err };
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
