import express from "express";
import cors from "cors";
import newsRoutes from "./routes/news.js"; // include .js extension for ESM

const app = express();

// Enable CORS
app.use(cors({
  origin: "*", // your frontend origin
  methods: ["GET", "POST"],
  credentials: false
}));

app.use(express.json());
app.use("/", newsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
