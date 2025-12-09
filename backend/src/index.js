require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET"],
}));
// Allow frontend to access backend
//app.use(cors());

// Allow JSON body parsing
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔️"))
  .catch(err => console.log("MongoDB Connection Error ❌", err));

// Routes
const salesRoutes = require("./routes/sales.routes");
app.use("/api/sales", salesRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Running on Port: ${PORT} 🚀`));
