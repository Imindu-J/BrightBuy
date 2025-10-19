const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');

// Test endpoint to check database connectivity
router.get('/test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    res.json({ message: 'Database connection successful', test: rows[0].test });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Place order with transaction safety and stock validation
router.post('/', authorize(['customer']), async (req, res) => {
  const { items, specialInstructions, deliveryMethod, paymentMethod } = req.body;
  
  console.log('Order request received:', { items, specialInstructions, deliveryMethod, paymentMethod, userId: req.user.id, userRole: req.user.role });
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  if (!req.user.id || isNaN(req.user.id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // Validate items structure
  for (const item of items) {
    if (!item.variantId || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ error: 'Invalid item data: variantId and quantity are required' });
    }
  }

  let connection;
  try {
    connection = await db.getConnection();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  try {
    await connection.beginTransaction();
    console.log('Transaction started');

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
    console.log('Creating order with total:', total);
    const [orderResult] = await connection.query(
      `INSERT INTO Customer_Order (UserID, Status, TotalAmount, Special_Instructions) 
       VALUES (?, 'pending', ?, ?)`,
      [req.user.id, total, specialInstructions || null]
    );

    const orderId = orderResult.insertId;
    console.log('Order created with ID:', orderId);

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
      console.log('Creating delivery record:', { orderId, deliveryMethod, estimatedDays });
      await connection.query(
        `INSERT INTO Delivery (Order_ID, Delivery_Method, Status, Estimated_days) 
         VALUES (?, ?, 'pending', ?)`,
        [orderId, deliveryMethod, estimatedDays]
      );
      console.log('Delivery record created');
    }

    // Create transaction record
    if (paymentMethod) {
      console.log('Creating transaction record:', { orderId, paymentMethod, total });
      await connection.query(
        `INSERT INTO Transaction (OrderID, Payment_Method, Status, Total_Amount) 
         VALUES (?, ?, 'pending', ?)`,
        [orderId, paymentMethod, total]
      );
      console.log('Transaction record created');
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
    console.log('Transaction committed successfully');

    res.json({ 
      message: 'Order placed successfully', 
      orderId: orderId,
      totalAmount: total,
      items: validatedItems.length
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Order placement error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
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
