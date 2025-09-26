const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Update delivery status
router.post('/update', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { orderId, method, address, status, trackingId } = req.body;
  await db.query(
    `INSERT INTO Delivery (Order_ID, Delivery_Method, Address, Status, Tracking_ID) 
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, method, address, status, trackingId]
  );
  res.json({ message: 'Delivery updated' });
});

module.exports = router;
