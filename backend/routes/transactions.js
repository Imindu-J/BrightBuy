const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Record payment (customer)
router.post('/', authorize(['customer']), async (req, res) => {
  const { orderId, method, amount, status } = req.body;
  const [result] = await db.query(
    `INSERT INTO Transaction (OrderID, Payment_Method, Status, Total_Amount) 
     VALUES (?, ?, ?, ?)`,
    [orderId, method, status, amount]
  );
  res.json({ message: 'Transaction recorded', paymentId: result.insertId });
});

module.exports = router;
