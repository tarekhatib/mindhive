const MAX_POINTS_PER_SESSION = 360;

const validatePomodoro = (req, res, next) => {
  const { points } = req.body;

  const n = Number(points);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return res.status(400).json({ message: "Points must be an integer" });
  }

  if (n <= 0) {
    return res.status(400).json({ message: "Points must be positive" });
  }

  if (n > MAX_POINTS_PER_SESSION) {
    return res.status(400).json({ message: "Points value too large" });
  }
  res.locals.pomodoroPoints = n;

  next();
};

module.exports = { validatePomodoro };