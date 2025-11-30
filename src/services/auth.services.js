const bcrypt = require("bcryptjs");
const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
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

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query(
      "INSERT INTO users (first_name, last_name, username, email, password_hash, profile_image) VALUES (?, ?, ?, ?, ?, NULL)",
      [first_name, last_name, username, email, hashedPassword]
    );

    return { message: "User registered successfully." };
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
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
      `SELECT 
          id,
          first_name,
          last_name,
          username,
          email,
          password_hash,
          profile_image
       FROM users 
       WHERE username = ? OR email = ?`,
      [identifier, identifier]
    );

    if (!results.length)
      throw { status: 401, message: "Invalid username/email or password" };

    const user = results[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      throw { status: 401, message: "Invalid username/email or password" };

    const { password_hash, ...safeUser } = user;

    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    try {
      const decoded = jwt.decode(refreshToken);
      const expiresAt =
        decoded?.exp
          ? new Date(decoded.exp * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked) VALUES (?, ?, ?, 0)",
        [user.id, hashToken(refreshToken), expiresAt]
      );
    } catch (e) {
      console.error("Refresh token persistence failed", e);
    }

    return {
      accessToken,
      refreshToken,
      user: safeUser, // includes profile_image
    };
  } catch (err) {
    if (err.status) throw err;
    throw { status: 500, message: "Database error", error: err };
  }
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "No refresh token provided." };

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokenHash = hashToken(refreshToken);
    const [rows] = await db.query(
      "SELECT id FROM refresh_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW()",
      [tokenHash]
    );

    if (!rows.length)
      throw { status: 403, message: "Invalid or expired refresh token." };

    const { password_hash, ...cleanPayload } = payload;

    const accessToken = generateAccessToken(cleanPayload);

    return { accessToken };
  } catch (err) {
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
    const hash = hashToken(refreshToken);
    const [result] = await db.query(
      "UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?",
      [hash]
    );

    if (!result.affectedRows)
      throw { status: 404, message: "Token not found." };

    return { message: "Logged out successfully." };
  } catch (err) {
    throw { status: 500, message: "Database error", error: err };
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};