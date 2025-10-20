const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

// Register new user (customer only - staff/admin created by admin)
router.post('/register', async (req, res) => {
    const { username, email, password, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await db.query(
            `INSERT INTO User (UserName, Email, PasswordHash, PhoneNumber, User_Address, Role)
            VALUES (?, ?, ?, ?, ?, 'customer')`,
            [username, email, hashedPassword, phone, address]
        );
        res.json({ message: 'Customer registered successfully', userId: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
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
        User_Address: user.User_Address,
        CreatedAt: user.CreatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify session and return fresh user info
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const [rows] = await db.query('SELECT * FROM User WHERE UserID = ?', [payload.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    return res.json({
      user: {
        UserID: user.UserID,
        UserName: user.UserName,
        Email: user.Email,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
        User_Address: user.User_Address,
        CreatedAt: user.CreatedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Change password - requires old password verification
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const [rows] = await db.query('SELECT * FROM User WHERE UserID = ?', [payload.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];

    // Verify old password
    const validOldPassword = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!validOldPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE User SET PasswordHash = ? WHERE UserID = ?',
      [hashedNewPassword, payload.id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile information
router.put('/update-profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { username, email, phoneNumber, address } = req.body;

    // Validate input
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Check if email is already taken by another user
    const [existingUser] = await db.query(
      'SELECT UserID FROM User WHERE Email = ? AND UserID != ?',
      [email, payload.id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email is already taken by another user' });
    }

    // Update user profile
    await db.query(
      `UPDATE User SET UserName = ?, Email = ?, PhoneNumber = ?, User_Address = ? 
       WHERE UserID = ?`,
      [username, email, phoneNumber || null, address || null, payload.id]
    );

    // Get updated user info
    const [updatedUser] = await db.query('SELECT * FROM User WHERE UserID = ?', [payload.id]);
    const user = updatedUser[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        UserID: user.UserID,
        UserName: user.UserName,
        Email: user.Email,
        Role: user.Role,
        PhoneNumber: user.PhoneNumber,
        User_Address: user.User_Address,
        CreatedAt: user.CreatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;