const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Get cart for logged in user
router.get('/', authorize(['customer']), async (req, res) => {
  const [rows] = await db.query(
    `SELECT ci.*, v.Colour, v.Size, v.Model 
     FROM Cart c
     JOIN Cart_Item ci ON c.CartID = ci.CartID
     JOIN Variant v ON ci.VariantID = v.VariantID
     WHERE c.UserID = ?`,
    [req.user.id]
  );
  res.json(rows);
});

// Add item to cart
router.post('/add', authorize(['customer']), async (req, res) => {
  const { variantId, quantity } = req.body;
  let [cart] = await db.query('SELECT * FROM Cart WHERE UserID = ?', [req.user.id]);
  if (cart.length === 0) {
    const [newCart] = await db.query('INSERT INTO Cart (UserID, Status) VALUES (?, "active")', [req.user.id]);
    cart = [{ CartID: newCart.insertId }];
  }
  await db.query(
    `INSERT INTO Cart_Item (CartID, VariantID, Quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE Quantity = Quantity + ?`,
    [cart[0].CartID, variantId, quantity, quantity]
  );
  res.json({ message: 'Item added to cart' });
});

module.exports = router;
