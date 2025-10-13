const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

// Register new user
router.post('/register', async (req, res) => {
    const { username, email, password, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await db.query(
            `INSERT INTO User (UserName, Email, PasswordHash, PhoneNumber, User_Address, Role)
            VALUES (?, ?, ?, ?, ?, 'customer')`,
            [username, email, hashedPassword, phone, address]
        );
        res.json({ message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user.UserID, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token + user info (without password hash)
    res.json({
      token,
      user: {
        UserID: user.UserID,
        UserName: user.UserName,
        Email: user.Email,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
        User_Address: user.User_Address
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;