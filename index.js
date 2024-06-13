const express = require("express");
const cors = require("cors");
const mongoose = require("./models/connection"); // Import the mongoose instance
const path = require("path");
const candidatesRouter = require("./route/route"); // Import candidate routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// mongoose();
// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/candidates", candidatesRouter);

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
