const bcrypt = require("bcryptjs");
const db = require("../config/db.js");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.js");

const register = (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;
  if (!first_name || !last_name || !username || !email || !password)
    return res.status(400).json({ message: "All fields required." });

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (first_name, last_name, username, email, password_hash) VALUES (?, ?, ?, ?, ?)",
    [first_name, last_name, username, email, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(400)
            .json({ message: "Username or email already exists." });
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({ message: "User registered successfully." });
    }
  );
};

const login = (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ message: "Missing credentials." });

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [identifier, identifier],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res
          .status(401)
          .json({ message: "Invalid username/email or password" });

      const user = results[0];
      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid)
        return res
          .status(401)
          .json({ message: "Invalid username/email or password" });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .json({
          accessToken,
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
};

module.exports = { register, login };
