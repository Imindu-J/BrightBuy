### Imports required modules:
```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → mini router for product variant-related endpoints.
- `db` → MySQL database connection pool.
- `authorize` → middleware to restrict certain routes to specific roles.

### Route 1: Get variants of a product
```
router.get('/:productId', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Variant WHERE ProductID = ?', [req.params.productId]);
  res.json(rows);
});
```

- **Endpoint:** `GET /variants/:productId`
- **Purpose:** Retrieve all variants (e.g., color, size, model) for a given product.
- **Parameters:**
    - `productId` → ID of the product whose variants are being requested.
- **Database query:** Selects all rows from Variant where `ProductID = ?`.
- **Response:** Array of variants for the specified product.

### Route 2: Add a new variant (admin only)
```
router.post('/', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { productId, colour, size, model, price, stock, reorder, status } = req.body;
  const [result] = await db.query(
    `INSERT INTO Variant (ProductID, Colour, Size, Model, Varient_Price, StockQuantity, RecorderLevel, Status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [productId, colour, size, model, price, stock, reorder, status]
  );
  res.json({ message: 'Variant added', id: result.insertId });
});
```

- **Endpoint:** `POST /variants/`
- **Purpose:** Add a new product variant into the system.
- **Authorization:** Only users with role `warehouse_admin` or `system_admin`.
- **Request body:**
    - `productId` → ID of the product this variant belongs to
    - `colour` → variant color
    - `size` → variant size
    - `model` → variant model name
    - `price` → variant price
    - `stock` → stock quantity available
    - `reorder` → reorder level (threshold to restock)
    - `status` → availability status (e.g., active/inactive)
- **Database query:** Inserts new row into Variant table.
- **Response:** `{ message: 'Variant added', id: result.insertId }`

### Exports
```
module.exports = router;
```

- Makes this variants router available in `server.js`, mounted at `/variants`.

>**Summary:**\
This file handles product variants. `GET /variants/:productId` returns all variants of a product, while `POST /variants` allows admins to add new variants with details like color, size, model, price, stock, and status.