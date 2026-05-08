const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const register = async (req, res) => {
  try {
    console.log("REGISTER REQ BODY:", req.body);

    const {
      nombre,
      email,
      password,
      role,
      numero_control,
      carrera,
      semestre,
      telefono,
      direccion,
      ciudad,
    } = req.body;

    // Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: "Nombre, email y password son requeridos",
      });
    }

    // Normalizar email
    const emailNormalizado = email.toLowerCase();

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con perfil completo
    const newUser = await User.create({
      nombre,
      email: emailNormalizado,
      password: hashedPassword,
      rol: role || "estudiante",
      numero_control,
      carrera,
      semestre,
      telefono,
      direccion,
      ciudad,
    });

    // Validar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no definido en .env");
    }

    // Generar token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: emailNormalizado,
        role: newUser.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        role: newUser.rol,
      },
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // Email o Número de Control duplicado
    if (error.code === "23505") {
      const field = error.detail.includes("email")
        ? "email"
        : "número de control";
      return res.status(409).json({
        message: `El ${field} ya está registrado`,
      });
    }

    return res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y password son requeridos",
      });
    }

    const emailNormalizado = email.toLowerCase();
    const user = await User.findByEmail(emailNormalizado);

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.rol,
        numero_control: user.numero_control,
        carrera: user.carrera,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener usuario", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.updateProfile(req.user.id, req.body);
    return res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar perfil", error: error.message });
  }
};

// REQ-03: Endpoint de conteo real de usuarios
const getUserCount = async (req, res) => {
  try {
    const total = await User.count();
    return res.json({ total });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al contar usuarios", error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, getUserCount };
