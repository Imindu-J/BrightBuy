const express = require('express');
const db = require('../utils/db');
const authorize = require('../middleware/auth');
const router = express.Router();

// Get assigned orders for staff
router.get('/orders', authorize(['staff']), async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.OrderID,
        o.OrderDate,
        o.Status,
        o.TotalAmount,
        o.Special_Instructions,
        u.UserName as CustomerName,
        u.Email as CustomerEmail,
        u.PhoneNumber as CustomerPhone,
        u.User_Address as CustomerAddress
      FROM Customer_Order o
      JOIN User u ON o.UserID = u.UserID
      WHERE o.Status IN ('pending', 'processing', 'shipped')
      ORDER BY o.OrderDate DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (staff only)
router.put('/orders/:orderId/status', authorize(['staff']), async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await db.query(
      'UPDATE Customer_Order SET Status = ? WHERE OrderID = ?',
      [status, orderId]
    );
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details with items
router.get('/orders/:orderId', authorize(['staff']), async (req, res) => {
  const { orderId } = req.params;
  
  try {
    // Get order info
    const [orderRows] = await db.query(`
      SELECT 
        o.*,
        u.UserName as CustomerName,
        u.Email as CustomerEmail,
        u.PhoneNumber as CustomerPhone,
        u.User_Address as CustomerAddress
      FROM Customer_Order o
      JOIN User u ON o.UserID = u.UserID
      WHERE o.OrderID = ?
    `, [orderId]);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const [items] = await db.query(`
      SELECT 
        oi.*,
        p.ProductName,
        p.Brand,
        v.Colour,
        v.Size,
        v.Model
      FROM Order_Item oi
      JOIN Variant v ON oi.VariantID = v.VariantID
      JOIN Product p ON v.ProductID = p.ProductID
      WHERE oi.OrderID = ?
    `, [orderId]);

    res.json({
      order: orderRows[0],
      items: items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get low stock products
router.get('/inventory/low-stock', authorize(['staff']), async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT 
        p.ProductID,
        p.ProductName,
        p.Brand,
        v.VariantID,
        v.Colour,
        v.Size,
        v.Model,
        v.StockQuantity,
        v.RecorderLevel
      FROM Product p
      JOIN Variant v ON p.ProductID = v.ProductID
      WHERE v.StockQuantity <= v.RecorderLevel
      ORDER BY v.StockQuantity ASC
    `);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product stock
router.put('/inventory/:variantId/stock', authorize(['staff']), async (req, res) => {
  const { variantId } = req.params;
  const { stockQuantity } = req.body;

  if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }

  try {
    await db.query(
      'UPDATE Variant SET StockQuantity = ? WHERE VariantID = ?',
      [stockQuantity, variantId]
    );
    res.json({ message: 'Stock updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
