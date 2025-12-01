const validatePomodoro = (req, res, next) => {
  const { points } = req.body;

  const n = Number(points);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return res.status(400).json({ message: "Points must be an integer" });
  }

  if (n <= 0) {
    return res.status(400).json({ message: "Points must be positive" });
  }
  
  if (points > 350) {
    return res.status(400).json({ message: "Points must be less than or equal to 350" });
  }

  res.locals.pomodoroPoints = n;

  next();
};

module.exports = { validatePomodoro };