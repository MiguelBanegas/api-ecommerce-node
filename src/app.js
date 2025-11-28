const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // Optional logging
require("dotenv").config();

const app = express();

// Middleware
// Middleware CORS
const allowedOrigins = [
  "https://mabcontrol.ar",
  "https://curso-react2025-mocha.vercel.app",
  "http://localhost:3003",
  "http://localhost:5173" // agregalo si usás Vite
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Esto habilita la respuesta a preflight automáticamente
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes"));
// Health check
app.get("/", (req, res) => {
  res.send("API E-commerce is running");
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
