const express = require('express');
const bcrypt = require('bcryptjs');
//const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
const router = express.Router();

// Create new staff or admin (admin-only)
router.post('/create-user', authorize(['admin']), async (req, res) => {
  const { username, email, password, role, phone, address } = req.body;

  if (!['staff', 'admin'].includes(role))
    return res.status(400).json({ error: 'Invalid role type'});

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO User (UserName, Email, PasswordHash, PhoneNumber, User_Address, Role) VALUES (?,?,?,?,?,?)',
      [username, email, hashedPassword, phone, address, role]
    );

    res.json({ message: `${role} created successfully`, userId: result.insertId});
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', authorize(['admin']), async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        UserID,
        UserName,
        Email,
        PhoneNumber,
        Role,
        CreatedAt,
        LastLogin,
        isActive,
        User_Address
      FROM User
      ORDER BY CreatedAt DESC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get('/orders', authorize(['admin']), async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.OrderID,
        o.OrderDate,
        o.Status,
        o.TotalAmount,
        o.Special_Instructions,
        u.UserName as CustomerName,
        u.Email as CustomerEmail
      FROM Customer_Order o
      JOIN User u ON o.UserID = u.UserID
      ORDER BY o.OrderDate DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user status (activate/deactivate)
router.put('/users/:userId/status', authorize(['admin']), async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  try {
    await db.query(
      'UPDATE User SET isActive = ? WHERE UserID = ?',
      [isActive, userId]
    );
    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new product
router.post('/add-product', authorize(['admin']), async (req, res) => {
  const { name, description, price, categoryId, SKU } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Product (ProductName, Description, Base_price, CategoryID, SKU)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, categoryId, SKU]
    );
    res.json({ message: 'Product added successfully', productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
