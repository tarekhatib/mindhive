const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return res.status(400).json({ message: "Passwords must be strings" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });
  }

  next();
};

const validateDeleteAccount = (req, res, next) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  next();
};

module.exports = {
  validateChangePassword,
  validateDeleteAccount,
};
