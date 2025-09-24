### Imports required modules:

```
const mysql = require('mysql2/promise');
require('dotenv').config();
```

- `mysql2/promise` → MySQL client library that supports Promises, so you can use `async/await` with it.
- `dotenv` → loads database credentials from a `.env` file.

### Creates a connection pool:

```
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});
```

- `createPool` → keeps a pool of up to 10 database connections ready for queries.
- `waitForConnections: true` → if all connections are busy, new queries will wait instead of failing.
- Uses environment variables for DB host, username, password, and database name.

### Exports the pool:
```
module.exports = pool;
```
- Allows other parts of your Node.js app to use this `pool` to query the database.
- Example usage:
```
const pool = require('./db');
const [rows] = await pool.query('SELECT * FROM products');
```

>**Summary:**\
This code sets up a reusable MySQL connection pool using environment variables, so your app can efficiently query the database using async/await.