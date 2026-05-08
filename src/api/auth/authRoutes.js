const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getUserCount,
} = require("../../controllers/authController");
const { authenticateToken } = require("../../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfile);

// REQ-03: Contador real de usuarios registrados (público — solo devuelve un número)
router.get("/count", getUserCount);

module.exports = router;
