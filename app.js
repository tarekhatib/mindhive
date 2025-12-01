const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require("./src/config/db");
const path = require("path");
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
const { authenticateToken } = require("./src/middleware/auth.middleware");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

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
  authenticateToken,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

module.exports = app;
