const authService = require("../services/auth.services.js");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
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
    res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = { register, login, refresh, logout };
