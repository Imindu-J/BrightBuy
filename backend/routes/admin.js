const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Add new product
router.post('/add-product', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { name, description, price, categoryId, SKU } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Product (ProductName, Description, Base_price, CategoryID, SKU)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, categoryId, SKU]
    );
    res.json({ message: 'Product added', productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
