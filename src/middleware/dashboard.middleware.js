const validatePomodoro = (req, res, next) => {
  const { points } = req.body;

  if (!points || isNaN(points) || Number(points) <= 0) {
    return res.status(400).json({ message: "Invalid or missing points" });
  }

  next();
};

module.exports = { validatePomodoro };