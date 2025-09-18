const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Example for customer-only routes
// app.use('/cart', authorize(['customer']), require('./routes/cart'));

app.listen(5000, () => console.log("Server running on port 5000"));
