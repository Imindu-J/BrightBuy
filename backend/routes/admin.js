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
    res.status(500).json({ error: err.message});
  }
});

// Add new product
router.post('/add-product', authorize(['admin','admin']), async (req, res) => {
  const { name, description, price, categoryId, SKU } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO Product (ProductName, Description, Base_price, CategoryID, SKU)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, categoryId, SKU]
    );
    res.json({ message: 'Product added succesfully', productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
