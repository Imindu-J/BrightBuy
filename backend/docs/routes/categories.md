### Imports required modules:
```
const router = require('express').Router();
const db = require('../utils/db');
const authorize = require('../middleware/auth');
```

- `express.Router()` → mini router for category-related endpoints.
- `db` → MySQL database connection pool.
- `authorize` → middleware to restrict access to certain routes (e.g., only admins).

### Route 1: Get all categories
```
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Category');
  res.json(rows);
});
```

- **Endpoint:** `GET /categories/`
- **Purpose:** Retrieve all product categories.
- **Authorization:** Public (no login required).
- **Database query:** Selects all rows from the Category table.
- **Response:** JSON array of categories.

### Route 2: Add a new category (admin only)
```
router.post('/', authorize(['system_admin']), async (req, res) => {
  const { name, description, parentId } = req.body;
  const [result] = await db.query(
    `INSERT INTO Category (CategoryID, CategoryName, Description, ParentCategoryID)
     VALUES (NULL, ?, ?, ?)`,
    [name, description, parentId || null]
  );
  res.json({ message: 'Category added', id: result.insertId });
});
```

- **Endpoint:** `POST /categories/`
- **Purpose:** Add a new category to the system.
- **Authorization:** Only users with role `system_admin`.
- **Request body:**
  - `name` → category name
  - `description` → category description
  - `parentId` (optional) → ID of a parent category (or `null` if it’s a root category).
- **Database query:** Inserts new category into the Category table.
- **Response:** `{ message: 'Category added', id: result.insertId }`

### Exports
```
module.exports = router;
```

- Makes this router available in `server.js`, mounted at `/categories`.

>**Summary:**\
This file manages categories. `GET /categories` returns all categories, while `POST /categories` allows a `system_admin` to create a new category (with optional parent-child hierarchy).