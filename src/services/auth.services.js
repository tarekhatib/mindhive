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

  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, username, email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return reject({
              status: 409,
              message: "Username or email already exists.",
            });
          return reject({ status: 500, message: "Database error", error: err });
        }
        resolve({ message: "User registered successfully." });
      }
    );
  });
};

const loginUser = async ({ identifier, password }) => {
  if (!identifier || !password)
    throw { status: 400, message: "Missing credentials." };

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [identifier, identifier],
      (err, results) => {
        if (err) return reject({ status: 500, message: "Database error" });
        if (results.length === 0)
          return reject({
            status: 401,
            message: "Invalid username/email or password",
          });

        const user = results[0];
        const isValid = bcrypt.compareSync(password, user.password_hash);
        if (!isValid)
          return reject({
            status: 401,
            message: "Invalid username/email or password",
          });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        resolve({
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
          },
        });
      }
    );
  });
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "No refresh token provided." };

  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err)
        return reject({
          status: 403,
          message: "Invalid or expired refresh token.",
        });

      const { password_hash, ...userData } = user;
      const accessToken = generateAccessToken(userData);
      resolve({ accessToken });
    });
  });
};

const logoutUser = async () => {
  return { message: "Logged out successfully." };
};

/* const logoutUser = async (refreshToken) => {
  if (!refreshToken)
    throw { status: 401, message: "No refresh token provided." };

  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM refresh_tokens WHERE token = ?",
      [refreshToken],
      (err, result) => {
        if (err) return reject({ status: 500, message: "Database error" });
        if (result.affectedRows === 0)
          return reject({ status: 404, message: "Token not found." });
        resolve({ message: "Logged out successfully." });
      }
    );
  });
}; */

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
