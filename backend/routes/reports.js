const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// View reports (system admin only)
router.get('/', authorize(['system_admin']), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Report');
  res.json(rows);
});

module.exports = router;
