const express = require("express");
const morgan = require("morgan");

// Express application
const app = express();

// parse incoming JSON requests
app.use(express.json());

// Use Morgan middleware to log HTTP requests
app.use(morgan('dev'))

//  health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(), // How long the server has been running (in seconds)
    message: "Express server is running 🚀",
  });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
