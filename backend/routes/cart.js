const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Get cart for logged in user with product details
router.get('/', authorize(['customer']), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        ci.CartID,
        ci.VariantID,
        ci.Quantity,
        ci.AddedAt,
        ci.UpdatedAt,
        v.Colour,
        v.Size,
        v.Model,
        v.Variant_Price as UnitPrice,
        v.StockQuantity,
        p.ProductID,
        p.ProductName,
        p.Brand,
        p.ImageURL as image
       FROM Cart c
       JOIN Cart_Item ci ON c.CartID = ci.CartID
       JOIN Variant v ON ci.VariantID = v.VariantID
       JOIN Product p ON v.ProductID = p.ProductID
       WHERE c.UserID = ? AND c.Status = 'active'
       ORDER BY ci.AddedAt DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart with stock validation
router.post('/add', authorize(['customer']), async (req, res) => {
  const { variantId, quantity } = req.body;
  
  console.log('Add to cart request:', { variantId, quantity, userId: req.user.id });
  
  if (!variantId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid variant ID or quantity' });
  }

  try {
    // Check stock availability
    const [stockRows] = await db.query(
      'SELECT StockQuantity, Variant_Price FROM Variant WHERE VariantID = ? AND Status = "Available"',
      [variantId]
    );
    
    if (stockRows.length === 0) {
      return res.status(400).json({ error: 'Product variant not available' });
    }
    
    const availableStock = stockRows[0].StockQuantity;
    if (availableStock < quantity) {
      return res.status(400).json({ 
        error: `Only ${availableStock} items available in stock` 
      });
    }

    // Get or create cart
    let [cart] = await db.query('SELECT * FROM Cart WHERE UserID = ? AND Status = "active"', [req.user.id]);
    if (cart.length === 0) {
      const [newCart] = await db.query('INSERT INTO Cart (UserID, Status) VALUES (?, "active")', [req.user.id]);
      cart = [{ CartID: newCart.insertId }];
    }

    // Add or update cart item
    await db.query(
      `INSERT INTO Cart_Item (CartID, VariantID, Quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE Quantity = Quantity + ?`,
      [cart[0].CartID, variantId, quantity, quantity]
    );

    res.json({ message: 'Item added to cart successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item quantity
router.put('/update', authorize(['customer']), async (req, res) => {
  const { variantId, quantity } = req.body;
  
  if (!variantId || quantity < 0) {
    return res.status(400).json({ error: 'Invalid variant ID or quantity' });
  }

  try {
    // Check if item exists in cart
    const [cartRows] = await db.query(
      `SELECT ci.*, v.StockQuantity 
       FROM Cart c
       JOIN Cart_Item ci ON c.CartID = ci.CartID
       JOIN Variant v ON ci.VariantID = v.VariantID
       WHERE c.UserID = ? AND ci.VariantID = ? AND c.Status = "active"`,
      [req.user.id, variantId]
    );

    if (cartRows.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item from cart
      await db.query(
        'DELETE FROM Cart_Item WHERE CartID = ? AND VariantID = ?',
        [cartRows[0].CartID, variantId]
      );
      res.json({ message: 'Item removed from cart' });
    } else {
      // Check stock availability
      if (cartRows[0].StockQuantity < quantity) {
        return res.status(400).json({ 
          error: `Only ${cartRows[0].StockQuantity} items available in stock` 
        });
      }

      // Update quantity
      await db.query(
        'UPDATE Cart_Item SET Quantity = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE CartID = ? AND VariantID = ?',
        [quantity, cartRows[0].CartID, variantId]
      );
      res.json({ message: 'Cart updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/remove/:variantId', authorize(['customer']), async (req, res) => {
  const { variantId } = req.params;
  
  try {
    const [cartRows] = await db.query(
      `SELECT ci.CartID 
       FROM Cart c
       JOIN Cart_Item ci ON c.CartID = ci.CartID
       WHERE c.UserID = ? AND ci.VariantID = ? AND c.Status = "active"`,
      [req.user.id, variantId]
    );

    if (cartRows.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    await db.query(
      'DELETE FROM Cart_Item WHERE CartID = ? AND VariantID = ?',
      [cartRows[0].CartID, variantId]
    );

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear entire cart
router.delete('/clear', authorize(['customer']), async (req, res) => {
  try {
    const [cartRows] = await db.query(
      'SELECT CartID FROM Cart WHERE UserID = ? AND Status = "active"',
      [req.user.id]
    );

    if (cartRows.length > 0) {
      await db.query(
        'DELETE FROM Cart_Item WHERE CartID = ?',
        [cartRows[0].CartID]
      );
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
