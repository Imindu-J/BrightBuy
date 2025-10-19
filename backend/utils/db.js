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

// The getConnection method is already available from mysql2/promise pool

module.exports = pool;