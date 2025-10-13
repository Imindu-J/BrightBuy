const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./utils/db'); // MySQL pool
const authorize = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/images', express.static('public/images'));

// Test DB connection
(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime');
    console.log('Database connected! Current time:', rows[0].currentTime);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/admin', require('./routes/admin'));
app.use('/categories', require('./routes/categories'));
app.use('/variants', require('./routes/variants'));
app.use('/cart', require('./routes/cart'));
app.use('/order', require('./routes/order'));
app.use('/delivery', require('./routes/delivery'));
app.use('/transactions', require('./routes/transactions'));
app.use('/reports', require('./routes/reports'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
