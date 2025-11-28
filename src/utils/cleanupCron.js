const cron = require("node-cron");
const { cleanupExpiredCarts } = require("../controllers/cartController");

/**
 * Configurar tarea programada para limpiar carritos expirados
 * Se ejecuta todos los días a las 3:00 AM
 */
const setupCleanupCron = () => {
  // Ejecutar todos los días a las 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    console.log("🧹 Ejecutando limpieza de carritos expirados...");
    try {
      const result = await cleanupExpiredCarts();
      console.log(
        `✅ Limpieza completada: ${result.deleted} carritos eliminados`
      );
    } catch (error) {
      console.error("❌ Error en limpieza de carritos:", error);
    }
  });

  console.log("⏰ Cron job de limpieza configurado (diario a las 3:00 AM)");
};

module.exports = setupCleanupCron;
