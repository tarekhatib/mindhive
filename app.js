const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require("./src/config/db");
const path = require("path");
const authRoutes = require("./src/routes/auth.routes.js");
const dashboardRoutes = require("./src/routes/dashboard.routes.js");
const notesRoutes = require("./src/routes/notes.routes.js");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", notesRoutes);

app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/dashboard", (req, res) => res.render("dashboard"));

module.exports = app;
