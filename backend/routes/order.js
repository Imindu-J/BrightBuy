const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Place order
router.post('/', authorize(['customer']), async (req, res) => {
  const { items, specialInstructions } = req.body;
  let total = 0;

  items.forEach(i => total += i.quantity * i.price);

  const [order] = await db.query(
    `INSERT INTO \`Order\` (UserID, Status, TotalAmount, Special_Instructions) 
     VALUES (?, 'pending', ?, ?)`,
    [req.user.id, total, specialInstructions]
  );

  for (const i of items) {
    await db.query(
      `INSERT INTO Order_Item (OrderID, VariantID, Quantity, UnitPrice, SubTotal) 
       VALUES (?, ?, ?, ?, ?)`,
      [order.insertId, i.variantId, i.quantity, i.price, i.quantity * i.price]
    );
  }

  res.json({ message: 'Order placed', orderId: order.insertId });
});

// Admin view all orders
router.get('/all', authorize(['system_admin','warehouse_admin']), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM `Order`');
  res.json(rows);
});

module.exports = router;
