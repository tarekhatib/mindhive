const authService = require("../services/auth.services");
const { accessCookieOptions, refreshCookieOptions } = require("../config/cookies");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

    res.cookie("token", encodeURIComponent(accessToken), accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      redirect: "/dashboard",
      user,
    });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = await authService.refreshAccessToken(refreshToken);

    res.cookie("token", encodeURIComponent(result.accessToken), accessCookieOptions);

    return res.json(result);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    res.clearCookie("token", accessCookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.json({ message: "Logged out successfully." });
  } catch (err) {
    res.clearCookie("token", accessCookieOptions);
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getCurrentUser = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ message: "Unauthorized" });

  return res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
};