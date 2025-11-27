const authService = require("../services/auth.services");

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
    const { accessToken, refreshToken, user } = await authService.loginUser(
      req.body
    );

    res.cookie("token", encodeURIComponent(accessToken), {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
    });

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

    res.cookie("token", encodeURIComponent(result.accessToken), {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

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

    const result = await authService.logoutUser(refreshToken);

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    return res.json(result);
  } catch (err) {
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