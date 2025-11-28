const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // Optional logging
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://mabcontrol.ar', 'http://localhost:3003']
}));
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
