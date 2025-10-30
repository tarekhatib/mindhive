const authService = require("../services/auth.services.js");

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
      user: {
        first_name: user.first_name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const result = await authService.refreshAccessToken(
      req.cookies?.refreshToken
    );
    return res.json(result);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    const result = await authService.logoutUser(req.cookies.refreshToken);
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
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching current user" });
  }
};

module.exports = { register, login, refresh, logout, getCurrentUser };
