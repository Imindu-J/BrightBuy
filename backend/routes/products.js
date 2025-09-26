const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Browse products
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Product WHERE Availability = 1');
  res.json(rows);
});

// Add product (warehouse or system admin)
router.post('/', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { name, description, brand, price, categoryId, sku } = req.body;
  const [result] = await db.query(
    `INSERT INTO Product (ProductName, Description, Brand, Base_price, CategoryID, SKU) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, description, brand, price, categoryId, sku]
  );
  res.json({ message: 'Product added', id: result.insertId });
});

module.exports = router;
