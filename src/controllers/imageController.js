const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

/**
 * Middleware para procesar y optimizar imágenes subidas
 * Redimensiona a máximo 1200px de ancho y optimiza calidad
 */
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const outputPath = path.join(
      path.dirname(filePath),
      `optimized-${req.file.filename}`
    );

    console.log("🖼️  Procesando imagen:", req.file.filename);

    // Optimizar imagen (max 1200px de ancho, calidad 80%)
    await sharp(filePath)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({ quality: 80 })
      .png({ quality: 80 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Eliminar archivo original
    await fs.unlink(filePath);

    // Renombrar archivo optimizado al nombre original
    await fs.rename(outputPath, filePath);

    console.log("✅ Imagen optimizada correctamente");
    next();
  } catch (error) {
    console.error("❌ Error procesando imagen:", error);
    // Si falla la optimización, continuar con la imagen original
    next();
  }
};

module.exports = { processImage };
