### Imports required modules:
```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → mini router for product-related endpoints.
- `db` → MySQL database connection pool.
- `authorize` → middleware to restrict certain routes to specific roles.

### Route 1: Browse products
```
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Product WHERE Availability = 1');
  res.json(rows);
});
```

- **Endpoint:** `GET /products/`
- **Purpose:** Retrieve all available products.
- **Authorization:** Public (no login required).
- **Database query:** Selects all rows from Product where `Availability = 1`.
- **Response:** Array of available products.

### Route 2: Add a new product (admin only)
```
router.post('/', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { name, description, brand, price, categoryId, sku } = req.body;
  const [result] = await db.query(
    `INSERT INTO Product (ProductName, Description, Brand, Base_price, CategoryID, SKU) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, description, brand, price, categoryId, sku]
  );
  res.json({ message: 'Product added', id: result.insertId });
});
```

- Endpoint: `POST /products/`
- Purpose: Add a new product into the system.
- Authorization: Only users with role `warehouse_admin` or `system_admin`.
- Request body:
  - `name` → product name
  - `description` → product description
  - `brand` → product brand
  - `price` → base price
  - `categoryId` → category the product belongs to
  - `sku` → unique stock keeping unit
- Database query: Inserts new row into Product table.
- Response: `{ message: 'Product added', id: result.insertId }`

### Exports
```
module.exports = router;
```

- Makes this products router available in `server.js`, mounted at `/products`.

>**Summary:**\
This file handles product operations. `GET /products` lists all available products for customers, while `POST /products` allows `warehouse_admin` and `system_admin` roles to add new products into the database.