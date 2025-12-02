const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./src/routes/auth.routes.js");
const dashboardRoutes = require("./src/routes/dashboard.routes.js");
const tasksRoutes = require("./src/routes/tasks.routes.js");
const settingsRoutes = require("./src/routes/settings.routes.js");
const notesRoutes = require("./src/routes/notes.routes.js");
const trashRoutes = require("./src/routes/trash.routes.js");
const profileRoutes = require("./src/routes/profile.routes.js");
const leaderboardRoutes = require("./src/routes/leaderboard.routes.js");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again in 1 minute.",
  })
);

app.use("/api/auth", authRoutes);

app.use("/", dashboardRoutes);
app.use("/", tasksRoutes);
app.use("/", settingsRoutes);
app.use("/", profileRoutes);
app.use("/", notesRoutes);
app.use("/", trashRoutes);
app.use("/", leaderboardRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File too large. Max size is 1MB.",
      });
    }
  }
  next(err);
});

app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = app;