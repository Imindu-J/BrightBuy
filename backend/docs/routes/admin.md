### Imports required modules:

```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → creates a mini Express router for product-related routes.
- `db` → MySQL database connection (from `utils/db.js`).
- `authorize` → middleware that checks if the user has the right role(s).

### Route: Add a new product

```
router.post('/add-product', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { name, description, price, categoryId, SKU } = req.body;
  ...
});
```

- Endpoint: `POST /add-product`
- Middleware: `authorize(['warehouse_admin','system_admin'])` → only users with roles `warehouse_admin` or `system_admin` can access.
- Expects request body with:
    - `name` → product name
    - `description` → product description
    - `price` → base price
    - `categoryId` → ID of category this product belongs to
    - `SKU` → stock-keeping unit (unique identifier)

### Database query:
```
const [result] = await db.query(
  `INSERT INTO Product (ProductName, Description, Base_price, CategoryID, SKU)
   VALUES (?, ?, ?, ?, ?)`,
  [name, description, price, categoryId, SKU]
);
```

- Uses parameterized SQL query (to prevent SQL injection).
- Inserts a new row into the Product table.
- Returns `insertId` → the auto-generated product ID.

### Response handling:

- Success → `{ message: 'Product added', productId: result.insertId }`
- Failure → HTTP 500 with `{ error: err.message }`

### Exports:
```
module.exports = router;
```

- Makes this router usable in the main `server.js` (mounted at `/products`).

>**Summary:**\
This file defines a `POST /products/add-product` API that allows `warehouse_admin` or `system_admin` users to add new products into the database. It takes product details from the request body, inserts them into the Product table, and returns the new product’s ID.