const validateChangePassword = (req, res, next) => {
  const { current_password, new_password } = req.body;

  if (typeof current_password !== "string" || typeof new_password !== "string") {
    return res.status(400).json({ message: "Passwords must be strings" });
  }

  if (new_password.trim().length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters long",
    });
  }

  next();
};

const validateDeleteAccount = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ message: "User not authenticated" });
  }
  next();
};

module.exports = {
  validateChangePassword,
  validateDeleteAccount,
};