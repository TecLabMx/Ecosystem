require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./api/auth/authRoutes");
const agendaRoutes = require("./api/agenda/agendaRoutes");
const noteRoutes = require("./api/notes/noteRoutes");
const directoryRoutes = require("./api/directory/directoryRoutes");
const serviceRoutes = require("./api/services/serviceRoutes");

const app = express();

// ── Seguridad y CORS ─────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());

// ── Middlewares ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos Estáticos (Frontend) ────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// ── Rutas API (PRIMERO SIEMPRE) ──────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/services", serviceRoutes);

// ── Rutas del Frontend ───────────────────────────────────────
app.get("/dashboard-alumno", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/dashboard-alumno.html"));
});

app.get("/dashboard-visitante", (_req, res) => {
  res.sendFile(
    path.join(__dirname, "../public/pages/dashboard-visitante.html"),
  );
});

// ── Ruta raíz (para evitar "Cannot GET /") ───────────────────
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ── Catch-all (SIEMPRE AL FINAL) ─────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
