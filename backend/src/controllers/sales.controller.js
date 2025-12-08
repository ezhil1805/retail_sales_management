const { filterSales } = require('../services/sales.service');

exports.getSales = async (req, res) => {
    try {
        const result = await filterSales(req.query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

