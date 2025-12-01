const express = require("express");
const http = require("http");
const path = require("path");
// Carga segura del WebSocket server (opcional)
let wss = null;
try {
  // Si existe, importamos el módulo ws-server para manejar upgrades
  const wsMod = require("./ws-server");
  wss = wsMod.wss;
  if (wss) {
    console.log("✅ WebSocket server cargado");
  } else {
    console.log("ℹ️  WebSocket server disponible pero desactivado (wss=null)");
  }
} catch (e) {
  console.warn("ℹ️  WebSocket server no disponible o fallo al cargar:", e.message);
}
const cors = require("cors");
const morgan = require("morgan"); // Optional logging
const setupCleanupCron = require("./utils/cleanupCron");

// Load environment variables
const fs = require("fs");
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      const value = valueParts.join("=").trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log("✅ Variables de entorno cargadas desde .env");
} else {
  console.warn("⚠️  Archivo .env no encontrado en:", envPath);
}

const app = express();
const server = http.createServer(app);

// Upgrade para WebSocket
server.on("upgrade", (request, socket, head) => {
  console.log("Upgrade request:", request.url);
  if (request.url === "/ws") {
    if (wss) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      console.warn("WS upgrade recibido pero no hay un servidor WS disponible");
      socket.destroy();
    }
  } else {
    console.log("WS connection rejected");
    socket.destroy();
  }
});

// Middleware CORS
const allowedOrigins = [
  "https://mabcontrol.ar",
  "https://curso-react2025-mocha.vercel.app",
  "http://localhost:3003",
  "http://localhost:5173", // agregalo si usás Vite
  "https://ecommerce.mabcontrol.ar",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== NUEVO: Servir archivos estáticos de uploads ==========
const uploadsPath = path.join(__dirname, "../uploads");
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada:", uploadsPath);
  }
} catch (err) {
  console.warn("⚠️  No se pudo asegurar la carpeta uploads:", err.message);
}

app.use("/uploads", express.static(uploadsPath));
console.log("📁 Sirviendo archivos estáticos desde:", uploadsPath);

// Si se solicita un archivo bajo /uploads y no existe, loguear para debugging
app.use("/uploads", (req, res) => {
  console.warn(`Archivo estático solicitado no encontrado: ${req.originalUrl}`);
  res.status(404).send("Not found");
});
// Routes
app.use("/api", require("./routes"));

// Health check
app.get("/", (req, res) => {
  res.send("API E-commerce is running");
});

// Endpoint para notificar a clientes WebSocket de nuevo build
/* app.post("/notify-build", (req, res) => { */
/*   const deployTime = new Date().toISOString(); */
/*   if (wss) { */
/*     // broadcast a todos los clientes conectados */
/*     wss.clients.forEach((client) => { */
/*       if (client.readyState === client.OPEN) { */
/*         client.send(JSON.stringify({ type: "NEW_BUILD", deployTime })); */
/*       } */
/*     }); */
/*     res.send({ */
/*       status: "ok", */
/*       message: "Notificación enviada a los clientes", */
/*       deployTime, */
/*     }); */
/*   } else { */
/*     res */
/*       .status(500) */
/*       .send({ status: "error", message: "WebSocket server no disponible" }); */
/*   } */
/* }); */

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  setupCleanupCron(); // Initialize cron job for cleaning expired carts
});

// Log simple health check para confirmar que el proceso sigue respondiendo
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});
