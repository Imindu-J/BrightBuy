const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Category');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add new category (admin only)
router.post('/', authorize(['system_admin']), async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    const [result] = await db.query(
      `INSERT INTO Category (CategoryID, CategoryName, Description, ParentCategoryID) VALUES (NULL, ?, ?, ?)`,
      [name, description, parentId || null]
    );
    res.json({ message: 'Category added', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

module.exports = router;
