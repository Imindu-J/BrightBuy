### Imports required modules:
```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → mini router for delivery-related endpoints.
- `db` → MySQL database connection pool.
- `authorize` → middleware that ensures only users with specific roles can access this route.

### Route: Update delivery status
```
router.post('/update', authorize(['warehouse_admin','system_admin']), async (req, res) => {
  const { orderId, method, address, status, trackingId } = req.body;
  await db.query(
    `INSERT INTO Delivery (Order_ID, Delivery_Method, Address, Status, Tracking_ID) 
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, method, address, status, trackingId]
  );
  res.json({ message: 'Delivery updated' });
});
```

- **Endpoint:** `POST /delivery/update`
- **Purpose:** Record or update delivery details for an order.
- **Authorization:** Only `warehouse_admin` or `system_admin` roles can access.
- **Request body:**
  - `orderId` → ID of the order being delivered.
  - `method` → delivery method (e.g., courier, in-house).
  - `address` → delivery address.
  - `status` → delivery status (e.g., pending, shipped, delivered).
  - `trackingId` → tracking number provided by the delivery service.
- **Database query:** Inserts a new record into the Delivery table.
- **Response:** `{ message: 'Delivery updated' }`

### Exports
```
module.exports = router;
```

- Makes this delivery router available in `server.js`, mounted at `/delivery`.

>**Summary:**\
This file defines a single endpoint `POST /delivery/update` that allows `warehouse_admin` or `system_admin` users to add/update delivery details for an order. It stores information like delivery method, address, status, and tracking ID in the Delivery table.