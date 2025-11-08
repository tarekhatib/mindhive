const attachUserId = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ message: "Unauthorized: no user found in token" });
  }
  req.body.user_id = req.user.id;
  next();
};

const validatePomodoro = (req, res, next) => {
  const { points } = req.body;
  if (!points || isNaN(points) || points <= 0) {
    return res.status(400).json({ message: "Invalid or missing points" });
  }
  next();
};

module.exports = { attachUserId, validatePomodoro };
