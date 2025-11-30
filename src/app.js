const express = require("express");
const http = require("http");
const path = require("path");
const { wss } = require("./ws-server");
const cors = require("cors");
const morgan = require("morgan"); // Optional logging
const setupCleanupCron = require("./utils/cleanupCron");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Upgrade para WebSocket
server.on("upgrade", (request, socket, head) => {
  console.log("Upgrade request:", request.url);
  if (request.url === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
console.log(
  "📁 Sirviendo archivos estáticos desde:",
  path.join(__dirname, "../uploads")
);

// Routes
app.use("/api", require("./routes"));

// Health check
app.get("/", (req, res) => {
  res.send("API E-commerce is running");
});

// Endpoint para notificar a clientes WebSocket de nuevo build
app.post("/notify-build", (req, res) => {
  const deployTime = new Date().toISOString();
  if (wss) {
    // broadcast a todos los clientes conectados
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: "NEW_BUILD", deployTime }));
      }
    });
    res.send({
      status: "ok",
      message: "Notificación enviada a los clientes",
      deployTime,
    });
  } else {
    res
      .status(500)
      .send({ status: "error", message: "WebSocket server no disponible" });
  }
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  setupCleanupCron(); // Initialize cron job for cleaning expired carts
});
