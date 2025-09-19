### Imports required modules:
```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → mini router for order-related endpoints.
- `db` → MySQL connection pool.
- `authorize` → middleware that restricts routes to authorized roles.

### Route 1: Place order
```
router.post('/', authorize(['customer']), async (req, res) => {
  const { items, specialInstructions } = req.body;
  let total = 0;

  items.forEach(i => total += i.quantity * i.price);

  const [order] = await db.query(
    `INSERT INTO \`Order\` (UserID, Status, TotalAmount, Special_Instructions) 
     VALUES (?, 'pending', ?, ?)`,
    [req.user.id, total, specialInstructions]
  );

  for (const i of items) {
    await db.query(
      `INSERT INTO Order_Item (OrderID, VariantID, Quantity, UnitPrice, SubTotal) 
       VALUES (?, ?, ?, ?, ?)`,
      [order.insertId, i.variantId, i.quantity, i.price, i.quantity * i.price]
    );
  }

  res.json({ message: 'Order placed', orderId: order.insertId });
});
```

- **Endpoint:** `POST /order/`
- **Purpose:** Allows a customer to place an order with multiple items.
- **Authorization:** Only `customer` role.
- **Request body:**
  - `items` → array of `{ variantId, quantity, price }`
  - `specialInstructions` → optional notes for the order.
- **Steps:**
  - Calculate total amount by summing up `quantity * price` for all items.
  - Insert new row into Order table with status = `"pending"`.
  - For each item, insert into Order_Item table with details (quantity, price, subtotal).
- **Response:** `{ message: 'Order placed', orderId: order.insertId }`

### Route 2: Admin view all orders
```
router.get('/all', authorize(['system_admin','warehouse_admin']), async (req, res) => {
  const [rows] = await db.query('SELECT * FROM `Order`');
  res.json(rows);
});
```

- **Endpoint:** `GET /order/all`
- **Purpose:** Allows admins to view all orders.
- **Authorization:** Only `system_admin` or `warehouse_admin` roles.
- **Database query:** Selects all rows from the Order table.
- **Response:** Array of all orders in the system.

### Exports
```
module.exports = router;
```

- Makes the order router available in `server.js`, mounted at `/order`.

>**Summary:**\
This file manages orders. `POST /order/` lets a customer place an order by adding items to the Order and Order_Item tables. `GET /order/all` allows `system_admin` and `warehouse_admin` users to view all orders in the system.