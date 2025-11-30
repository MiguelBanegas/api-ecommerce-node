// Carga dinámica de Resend para evitar errores si la librería es ESM-only
// Función helper para obtener la instancia de Resend
const getResendInstance = async () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY no está configurada en las variables de entorno"
    );
  }

  // Import dinámico (soporta paquetes ESM cuando el proyecto es CommonJS)
  const mod = await import("resend");
  // Manejar distintos formatos de export (named/default)
  const ResendClass = mod.Resend || mod.default?.Resend || mod.default || mod;

  return new ResendClass(process.env.RESEND_API_KEY);
};

/**
 * Endpoint de prueba para enviar un email de prueba
 * POST /api/test-email
 * Body: { email: "destinatario@ejemplo.com" }
 */
const sendTestEmail = async (req, res) => {
  try {
    // Debug: mostrar si la variable RESEND_API_KEY está presente (no mostrar el valor)
    console.log("DEBUG: RESEND_API_KEY set?", !!process.env.RESEND_API_KEY);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Por favor proporciona un email de destino",
      });
    }

    // Validar que RESEND_API_KEY esté configurada
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "RESEND_API_KEY no está configurada en las variables de entorno",
      });
    }

    console.log(`📧 Enviando email de prueba a: ${email}`);

    const resend = await getResendInstance();
    const { data, error } = await resend.emails.send({
      from: "Ventas <noreply@mabcontrol.ar>",
      to: email,
      subject: "Email de Prueba - MAB Control",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                color: #2c3e50;
                margin-bottom: 20px;
              }
              .info-box {
                background-color: #e8f4f8;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #7f8c8d;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h1>✅ Email de Prueba Exitoso</h1>
                <p>¡Hola!</p>
                <p>Este es un email de prueba enviado desde tu API de E-commerce.</p>
                
                <div class="info-box">
                  <strong>Información del envío:</strong>
                  <ul>
                    <li>Fecha: ${new Date().toLocaleString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                    })}</li>
                    <li>Servicio: Resend API</li>
                    <li>Remitente: noreply@mabcontrol.ar</li>
                  </ul>
                </div>

                <p>Si recibiste este email, significa que la configuración de envío de emails está funcionando correctamente. 🎉</p>
                
                <p>Saludos,<br><strong>MAB Control Team</strong></p>
              </div>
              
              <div class="footer">
                <p>Este es un email automático de prueba. No es necesario responder.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Error al enviar email:", error);
      return res.status(400).json({
        success: false,
        error: error.message || "Error al enviar el email",
      });
    }

    console.log("✅ Email enviado exitosamente:", data);

    res.status(200).json({
      success: true,
      message: "Email de prueba enviado exitosamente",
      data: {
        id: data.id,
        to: email,
        from: "noreply@mabcontrol.ar",
      },
    });
  } catch (error) {
    console.error("❌ Error en sendTestEmail:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error interno del servidor",
    });
  }
};

module.exports = { sendTestEmail };
