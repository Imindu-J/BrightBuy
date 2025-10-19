const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'BrightBuy',
    waitForConnections: true,
    connectionLimit: 10,
});

// Add getConnection method for transactions
pool.getConnection = async () => {
    return await pool.getConnection();
};

module.exports = pool;