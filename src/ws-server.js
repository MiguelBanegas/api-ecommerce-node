let wss = null;
let broadcastNewBuild = () => {};

try {
  const WebSocket = require("ws");

  wss = new WebSocket.Server({ noServer: true });
  let clients = [];

  // Función para enviar mensaje a todos los clientes
  broadcastNewBuild = function () {
    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "NEW_BUILD", version: Date.now() }));
      }
    });
  };

  wss.on("connection", (ws) => {
    console.log("Cliente WS conectado");
    clients.push(ws);

    ws.on("close", () => {
      clients = clients.filter((c) => c !== ws);
    });
  });
} catch (err) {
  console.warn("ℹ️  'ws' no está disponible — WebSocket desactivado.", err.message);
  // Exportar stubs (wss = null y broadcastNewBuild noop)
}

module.exports = { wss, broadcastNewBuild };
