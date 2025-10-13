const authService = require("../services/auth.services.js");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ message: err.message });
    }
    if (err.message === "Invalid input") {
      return res.status(400).json({ message: err.message });
    }
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Invalid password") {
      return res.status(401).json({ message: err.message });
    }
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const result = await authService.refreshAccessToken(
      req.cookies?.refreshToken
    );
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid refresh token") {
      return res.status(401).json({ message: err.message });
    }
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const result = await authService.logoutUser();
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid refresh token") {
      return res.status(401).json({ message: err.message });
    }
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = { register, login, refresh, logout };
