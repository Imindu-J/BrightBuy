const router = require('express').Router();
const db = require('../utils/db');

// Get all products
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Product WHERE Availability = 1');
  res.json(rows);
});

module.exports = router;
