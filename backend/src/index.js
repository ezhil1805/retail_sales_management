const express = require('express');
const cors = require('cors');

const salesRoutes = require('./routes/sales.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Register Route
app.use("/api", salesRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
