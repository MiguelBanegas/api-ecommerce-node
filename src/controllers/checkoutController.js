const express = require("express");
const router = express.Router();

// Carga dinámica de Resend para evitar errores si la librería es ESM-only
// Función helper para obtener la instancia de Resend
const getResendInstance = async () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY no está configurada en las variables de entorno"
    );
  }

  const mod = await import("resend");
  const ResendClass = mod.Resend || mod.default?.Resend || mod.default || mod;
  return new ResendClass(process.env.RESEND_API_KEY);
};

// POST /api/checkout
router.post("/", async (req, res) => {
  const { userEmail, cartItems, total } = req.body;

  // Validación básica
  if (!userEmail || !cartItems || !total) {
    return res.status(400).json({
      success: false,
      error: "Faltan datos requeridos: userEmail, cartItems, total",
    });
  }

  try {
    // ... (Tu lógica existente para guardar la orden) ...

    // Enviar email de confirmación
    const resend = await getResendInstance();
    await resend.emails.send({
      from: "Ventas <noreply@mabcontrol.ar>",
      to: userEmail,
      subject: "Confirmación de Compra",
      html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>Hemos recibido tu pedido.</p>
        <ul>
          ${cartItems
            .map(
              (item) =>
                `<li>${item.nombre} x ${item.cantidad} - $${item.precio}</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total: $${total}</strong></p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Compra exitosa y email enviado",
    });
  } catch (error) {
    console.error("Error en checkout:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
