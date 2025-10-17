// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./utils/db');
const authorize = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Static file serving (for images)
app.use('/images', express.static('public/images'));

// Test DB connection at startup
// Test connection on startup
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    console.log('Database connected! Test query returned:', rows[0].test);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit if DB cannot connect
  }
})();

// Route Imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const variantRoutes = require('./routes/variants');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const deliveryRoutes = require('./routes/delivery');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');

// Public Routes (no auth required)
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/variants', variantRoutes);

// Protected Routes (require login and role checks)
app.use('/admin', authorize(['admin']), adminRoutes);
app.use('/order', authorize(['customer', 'staff', 'admin']), orderRoutes);
app.use('/cart', authorize(['customer']), cartRoutes);
app.use('/delivery', authorize(['staff', 'admin']), deliveryRoutes);
app.use('/transactions', authorize(['admin']), transactionRoutes);
app.use('/reports', authorize(['admin', 'staff']), reportRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Retail Management API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
