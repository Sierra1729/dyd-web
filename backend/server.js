require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongodb");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require("./routes/user");
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});