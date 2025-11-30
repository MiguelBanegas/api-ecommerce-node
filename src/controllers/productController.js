const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const upload = require("../middleware/uploadMiddleware");
const { processImage } = require("./imageController");

// ========== NUEVA RUTA: Upload de imagen ==========
router.post(
  "/upload-image",
  upload.single("image"),
  processImage,
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionó ninguna imagen" });
    }

    try {
      // Generar URL pública
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${
        req.file.filename
      }`;

      console.log("✅ Imagen subida:", req.file.filename);

      res.json({
        success: true,
        imageUrl: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Error en upload:", error);
      res.status(500).json({ error: "Error al procesar la imagen" });
    }
  }
);

// ========== RUTAS EXISTENTES ==========

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

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, descripcion, avatar } = req.body;
    // Check if product exists
    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (precio !== undefined) updateData.precio = precio;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (avatar !== undefined) updateData.avatar = avatar;
    // Update the document
    await docRef.update(updateData);
    res.json({
      id,
      message: "Product updated successfully",
      updated: updateData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Check if product exists
    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Delete the document
    await docRef.delete();
    res.json({
      id,
      message: "Product deleted successfully",
    });
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
