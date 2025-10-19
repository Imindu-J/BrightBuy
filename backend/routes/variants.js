const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Get variants of a product
router.get('/:productId', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Variant WHERE ProductID = ?', [req.params.productId]);
  res.json(rows);
});

// Add variant (warehouse admin only)
router.post('/', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { productId, colour, size, model, price, stock, reorder, status } = req.body;
  const [result] = await db.query(
    `INSERT INTO Variant (ProductID, Colour, Size, Model, Variant_Price, StockQuantity, RecorderLevel, Status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [productId, colour, size, model, price, stock, reorder, status]
  );
  res.json({ message: 'Variant added', id: result.insertId });
});

module.exports = router;
