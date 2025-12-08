const express = require("express");
const router = express.Router();
const { filterSales } = require("../services/sales.service");

router.get("/sales", async (req, res) => {
  try {
    const data = await filterSales(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
