const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Category');
  res.json(rows);
});

// Add new category (admin only)
router.post('/', authorize(['system_admin']), async (req, res) => {
  const { name, description, parentId } = req.body;
  const [result] = await db.query(
    `INSERT INTO Category (CategoryID, CategoryName, Description, ParentCategoryID) VALUES (NULL, ?, ?, ?)`,
    [name, description, parentId || null]
  );
  res.json({ message: 'Category added', id: result.insertId });
});

module.exports = router;
