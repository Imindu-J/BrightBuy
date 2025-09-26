### Imports required modules:
```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → mini Express router for cart-related endpoints.
- `db` → MySQL connection pool.
- `authorize` → middleware that ensures only logged-in `customer` users can access these routes.

### Route 1: Get cart for logged-in user
```
router.get('/', authorize(['customer']), async (req, res) => {
  const [rows] = await db.query(
    `SELECT ci.*, v.Colour, v.Size, v.Model 
     FROM Cart c
     JOIN Cart_Item ci ON c.CartID = ci.CartID
     JOIN Variant v ON ci.VariantID = v.VariantID
     WHERE c.UserID = ?`,
    [req.user.id]
  );
  res.json(rows);
});
```

- **Endpoint:** `GET /cart/`
- **Purpose:** Retrieve the contents of the logged-in user’s cart.
- **Authorization:** Only `customer` role.
- **Query:**
  - Joins `Cart`, `Cart_Item`, and `Variant` tables.
  - Returns each item in the cart along with its variant details (`Colour`, `Size`, `Model`).
- **Response:** List of cart items for the current user.

### Route 2: Add item to cart
```
router.post('/add', authorize(['customer']), async (req, res) => {
  const { variantId, quantity } = req.body;
  ...
});
```

- **Endpoint:** `POST /cart/add`
- **Purpose:** Add a new item (variant) to the user’s cart, or increase the quantity if it already exists.
- **Steps:**
  - Check if the user already has a cart.
    - If not, create a new cart row with `Status = "active"`.
  - Insert the item into `Cart_Item`.
    - Uses `ON DUPLICATE KEY UPDATE` to increment the quantity if the same variant already exists in the cart.

```
INSERT INTO Cart_Item (CartID, VariantID, Quantity)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE Quantity = Quantity + ?
```

- **Success response:** `{ message: 'Item added to cart' }`

### Exports
```
module.exports = router;
```


- Makes the cart router available in `server.js`, mounted at `/cart`.

>**Summary:**\
This file manages the customer’s shopping cart. `GET /cart` fetches the logged-in customer’s cart items with variant details, while `POST /cart/add` adds new items or increases the quantity of existing ones. The cart is automatically created if the user doesn’t already have one. Only users with the `customer` role can access these routes.