const express = require("express");
const app = express();
const newsRoutes = require("./routes/news");

app.use(express.json());
app.use("/", newsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
