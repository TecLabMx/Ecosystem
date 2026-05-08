// src/api/cafeteria/cafeteriaRoutes.js
// REQ-02: Rutas del módulo cafetería protegidas por rol
const express = require("express");
const router = express.Router();
const cafeteriaController = require("../../controllers/cafeteriaController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../middlewares/authMiddleware");

// ── Roles con acceso de gestión ────────────────────────────────
const GESTORES = ["admin", "cafeteria"];

// ── Público: cualquiera puede ver el menú del día ─────────────
router.get("/menu", cafeteriaController.getMenu);

// ── Protegidos: solo admin / cafetería ────────────────────────
router.post(
  "/menu",
  authenticateToken,
  authorizeRoles(GESTORES),
  cafeteriaController.uploadMenu,
);

router.delete(
  "/menu",
  authenticateToken,
  authorizeRoles(GESTORES),
  cafeteriaController.deleteMenu,
);

module.exports = router;
