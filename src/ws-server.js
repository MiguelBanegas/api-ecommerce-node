const WebSocket = require("ws");

const wss = new WebSocket.Server({ noServer: true });
let clients = [];

// Función para enviar mensaje a todos los clientes
function broadcastNewBuild() {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "NEW_BUILD", version: Date.now() }));
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Cliente WS conectado");
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

module.exports = { wss, broadcastNewBuild };
