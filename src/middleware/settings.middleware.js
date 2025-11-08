const validateChangePassword = (req, res, next) => {
  const { new_password } = req.body;

  if (typeof new_password !== "string") {
    return res.status(400).json({ message: "New password must be a string" });
  }

  if (new_password.length < 6) {
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
