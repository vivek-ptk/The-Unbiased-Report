const express = require("express");
const cors = require("cors");
const app = express();
const newsRoutes = require("./routes/news");

// Enable CORS for all origins (you can restrict this in production)
app.use(cors({
  origin: "http://localhost:3000", // your frontend origin
  methods: ["GET", "POST"],
  credentials: false // set to true if you're using cookies/auth headers
}));

// Middleware to parse JSON
app.use(express.json());

// Use your routes
app.use("/", newsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
