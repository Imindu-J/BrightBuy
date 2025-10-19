const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Place order with transaction safety and stock validation
router.post('/', authorize(['customer']), async (req, res) => {
  const { items, specialInstructions, deliveryMethod, paymentMethod } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Validate all items and calculate total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const [variantRows] = await connection.query(
        'SELECT VariantID, Variant_Price, StockQuantity, Status FROM Variant WHERE VariantID = ?',
        [item.variantId]
      );

      if (variantRows.length === 0) {
        throw new Error(`Product variant ${item.variantId} not found`);
      }

      const variant = variantRows[0];
      if (variant.Status !== 'Available') {
        throw new Error(`Product variant ${item.variantId} is not available`);
      }

      if (variant.StockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for variant ${item.variantId}. Available: ${variant.StockQuantity}, Requested: ${item.quantity}`);
      }

      const itemTotal = item.quantity * variant.Variant_Price;
      total += itemTotal;

      validatedItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: variant.Variant_Price,
        subTotal: itemTotal
      });
    }

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO Customer_Order (UserID, Status, TotalAmount, Special_Instructions) 
       VALUES (?, 'pending', ?, ?)`,
      [req.user.id, total, specialInstructions || null]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of validatedItems) {
      // Insert order item
      await connection.query(
        `INSERT INTO Order_Item (OrderID, VariantID, Quantity, UnitPrice, SubTotal) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.variantId, item.quantity, item.unitPrice, item.subTotal]
      );

      // Update stock
      await connection.query(
        'UPDATE Variant SET StockQuantity = StockQuantity - ? WHERE VariantID = ?',
        [item.quantity, item.variantId]
      );
    }

    // Create delivery record
    if (deliveryMethod) {
      const estimatedDays = deliveryMethod === 'store_pickup' ? 1 : 5;
      await connection.query(
        `INSERT INTO Delivery (Order_ID, Delivery_Method, Status, Estimated_days) 
         VALUES (?, ?, 'pending', ?)`,
        [orderId, deliveryMethod, estimatedDays]
      );
    }

    // Create transaction record
    if (paymentMethod) {
      await connection.query(
        `INSERT INTO Transaction (OrderID, Payment_Method, Status, Total_Amount) 
         VALUES (?, ?, 'pending', ?)`,
        [orderId, paymentMethod, total]
      );
    }

    // Clear user's cart
    const [cartRows] = await connection.query(
      'SELECT CartID FROM Cart WHERE UserID = ? AND Status = "active"',
      [req.user.id]
    );

    if (cartRows.length > 0) {
      await connection.query(
        'DELETE FROM Cart_Item WHERE CartID = ?',
        [cartRows[0].CartID]
      );
    }

    await connection.commit();

    res.json({ 
      message: 'Order placed successfully', 
      orderId: orderId,
      totalAmount: total,
      items: validatedItems.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Order placement error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Get user's orders
router.get('/my-orders', authorize(['customer']), async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT 
        o.OrderID,
        o.OrderDate,
        o.Status,
        o.TotalAmount,
        o.Special_Instructions,
        d.Delivery_Method,
        d.Status as DeliveryStatus,
        t.Payment_Method,
        t.Status as PaymentStatus
       FROM Customer_Order o
       LEFT JOIN Delivery d ON o.OrderID = d.Order_ID
       LEFT JOIN Transaction t ON o.OrderID = t.OrderID
       WHERE o.UserID = ?
       ORDER BY o.OrderDate DESC`,
      [req.user.id]
    );

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT 
          oi.*,
          v.Colour,
          v.Size,
          v.Model,
          p.ProductName,
          p.Brand
         FROM Order_Item oi
         JOIN Variant v ON oi.VariantID = v.VariantID
         JOIN Product p ON v.ProductID = p.ProductID
         WHERE oi.OrderID = ?`,
        [order.OrderID]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details
router.get('/:orderId', authorize(['customer', 'staff', 'admin']), async (req, res) => {
  const { orderId } = req.params;
  
  try {
    // Check if user can access this order
    const [orderRows] = await db.query(
      `SELECT 
        o.*,
        u.UserName,
        u.Email,
        u.PhoneNumber,
        u.User_Address,
        d.Delivery_Method,
        d.Status as DeliveryStatus,
        d.Estimated_Delivery,
        t.Payment_Method,
        t.Status as PaymentStatus
       FROM Customer_Order o
       JOIN User u ON o.UserID = u.UserID
       LEFT JOIN Delivery d ON o.OrderID = d.Order_ID
       LEFT JOIN Transaction t ON o.OrderID = t.OrderID
       WHERE o.OrderID = ?`,
      [orderId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRows[0];

    // Check authorization
    if (req.user.role === 'customer' && order.UserID !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get order items
    const [items] = await db.query(
      `SELECT 
        oi.*,
        v.Colour,
        v.Size,
        v.Model,
        p.ProductName,
        p.Brand,
        p.ImageURL
       FROM Order_Item oi
       JOIN Variant v ON oi.VariantID = v.VariantID
       JOIN Product p ON v.ProductID = p.ProductID
       WHERE oi.OrderID = ?`,
      [orderId]
    );

    order.items = items;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (staff/admin only)
router.put('/:orderId/status', authorize(['staff', 'admin']), async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await db.query(
      'UPDATE Customer_Order SET Status = ? WHERE OrderID = ?',
      [status, orderId]
    );

    // If order is cancelled, restore stock
    if (status === 'cancelled') {
      const [items] = await db.query(
        'SELECT VariantID, Quantity FROM Order_Item WHERE OrderID = ?',
        [orderId]
      );

      for (const item of items) {
        await db.query(
          'UPDATE Variant SET StockQuantity = StockQuantity + ? WHERE VariantID = ?',
          [item.Quantity, item.VariantID]
        );
      }
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin view all orders
router.get('/admin/all', authorize(['admin']), async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT 
        o.OrderID,
        o.OrderDate,
        o.Status,
        o.TotalAmount,
        o.Special_Instructions,
        u.UserName,
        u.Email,
        d.Delivery_Method,
        d.Status as DeliveryStatus,
        t.Payment_Method,
        t.Status as PaymentStatus
       FROM Customer_Order o
       JOIN User u ON o.UserID = u.UserID
       LEFT JOIN Delivery d ON o.OrderID = d.Order_ID
       LEFT JOIN Transaction t ON o.OrderID = t.OrderID
       ORDER BY o.OrderDate DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
