const { Router } = require("express");
const router = Router();
const { db } = require("../config/firebase");

// Get all products
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a product
router.post("/", async (req, res) => {
  try {
    const { nombre, precio, descripcion, avatar } = req.body;

    // Basic validation
    if (!nombre || !precio) {
      return res.status(400).json({ error: "Nombre and precio are required" });
    }

    const docRef = await db.collection("products").add({
      nombre,
      precio, // Keeping as string as per input
      descripcion: descripcion || "",
      avatar: avatar || "",
    });
    res
      .status(201)
      .json({ id: docRef.id, message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed products (Bulk insert)
router.post("/seed", async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: "Input must be an array of products" });
    }

    const batch = db.batch();

    products.forEach((product) => {
      const docRef = db.collection("products").doc(); // Auto-ID
      batch.set(docRef, {
        nombre: product.nombre,
        precio: product.precio,
        descripcion: product.descripcion || "",
        avatar: product.avatar || "",
      });
    });

    await batch.commit();
    res
      .status(201)
      .json({ message: `Successfully seeded ${products.length} products` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
