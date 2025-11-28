const { Router } = require("express");
const router = Router();
const { db } = require("../config/firebase");

// Get all users
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a user
router.post("/", async (req, res) => {
  try {
    const { nombre, email, pass } = req.body;

    if (!nombre || !email || !pass) {
      return res
        .status(400)
        .json({ error: "Nombre, email and pass are required" });
    }

    const docRef = await db.collection("users").add({
      nombre,
      email,
      pass, // Note: In a production app, passwords should be hashed!
    });
    res
      .status(201)
      .json({ id: docRef.id, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed users (Bulk insert)
router.post("/seed", async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Input must be an array of users" });
    }

    const batch = db.batch();

    users.forEach((user) => {
      const docRef = db.collection("users").doc(); // Auto-ID
      batch.set(docRef, {
        nombre: user.nombre,
        email: user.email,
        pass: user.pass,
      });
    });

    await batch.commit();
    res
      .status(201)
      .json({ message: `Successfully seeded ${users.length} users` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
