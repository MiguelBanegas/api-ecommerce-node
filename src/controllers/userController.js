const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

// Get all users
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a user (registro)
router.post("/", async (req, res) => {
  try {
    const { nombre, email, pass } = req.body;

    // Validación básica
    if (!nombre || !email || !pass) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Verificar si el email ya existe
    const snapshot = await db
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Crear usuario con rol 'user' por defecto
    const docRef = await db.collection("users").add({
      nombre,
      email: email.toLowerCase(),
      pass,
      role: "user", // ← Por defecto todos son usuarios comunes
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      id: docRef.id,
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar rol
    if (!["admin", "user"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Rol inválido. Debe ser 'admin' o 'user'" });
    }

    const docRef = db.collection("users").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await docRef.update({ role });

    res.json({
      id,
      message: "Rol actualizado exitosamente",
      role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("users").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await docRef.delete();

    res.json({
      id,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
