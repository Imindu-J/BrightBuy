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

// Example for customer-only routes
// app.use('/cart', authorize(['customer']), require('./routes/cart'));

app.listen(5000, () => console.log("Server running on port 5000"));
