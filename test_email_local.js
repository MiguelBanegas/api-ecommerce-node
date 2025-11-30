/**
 * Script para probar el envío de emails en LOCALHOST
 *
 * Uso:
 * 1. Asegúrate de que el servidor esté corriendo (npm start)
 * 2. Ejecuta: node test_email_local.js tu-email@ejemplo.com
 */

const http = require("http");

// Obtener el email del argumento de línea de comandos
const emailDestino = process.argv[2];

if (!emailDestino) {
  console.error("❌ Error: Debes proporcionar un email de destino");
  console.log("\nUso: node test_email_local.js tu-email@ejemplo.com");
  process.exit(1);
}

// Validar formato de email básico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailDestino)) {
  console.error("❌ Error: El email proporcionado no es válido");
  process.exit(1);
}

const data = JSON.stringify({
  email: emailDestino,
});

const options = {
  hostname: "localhost",
  port: 3003,
  path: "/api/test-email",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

console.log("📧 Enviando email de prueba (LOCALHOST)...");
console.log(`📬 Destinatario: ${emailDestino}`);
console.log(
  `🌐 Endpoint: http://${options.hostname}:${options.port}${options.path}`
);
console.log("");

const req = http.request(options, (res) => {
  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log("");

    try {
      const jsonResponse = JSON.parse(responseData);

      if (res.statusCode === 200) {
        console.log("✅ ¡Email enviado exitosamente!");
        console.log("");
        console.log("📋 Detalles:");
        console.log(`   - ID: ${jsonResponse.data?.id || "N/A"}`);
        console.log(`   - Para: ${jsonResponse.data?.to || emailDestino}`);
        console.log(`   - Desde: ${jsonResponse.data?.from || "N/A"}`);
        console.log("");
        console.log(
          "💡 Revisa tu bandeja de entrada (y spam) para ver el email."
        );
      } else {
        console.error("❌ Error al enviar el email:");
        console.error(`   ${jsonResponse.error || jsonResponse.message}`);
      }
    } catch (e) {
      console.error("❌ Error al parsear la respuesta:");
      console.error(responseData);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Error de conexión:");
  console.error(error.message);
  console.log("");
  console.log("💡 Asegúrate de que:");
  console.log("   1. El servidor esté corriendo en el puerto 3003");
  console.log("   2. Ejecuta: npm start");
  console.log("   3. La variable RESEND_API_KEY esté configurada en .env");
});

req.write(data);
req.end();
