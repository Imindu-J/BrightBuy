### Imports required modules:
```
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
```

- `express.Router()` → mini Express router for authentication-related routes.
- `bcryptjs` → used for hashing passwords securely.
- `jsonwebtoken` → generates and verifies JWT tokens for authentication.
- `db` → MySQL connection pool.

### Route 1: Register a new user
```
router.post('/register', async (req, res) => {
  const { username, email, password, phone, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  ...
});
```

- **Endpoint:** `POST /auth/register`
- **Purpose:** Register a new customer.
- **Steps:**
    - Hashes the password using bcrypt (with 10 salt rounds).
    - Inserts the new user into the User table with default role = `customer`.

```
INSERT INTO User (UserName, Email, PasswordHash, PhoneNumber, User_Address, Role)
VALUES (?, ?, ?, ?, ?, 'customer')
```

- **Success response:** `{ message: 'User registered successfully', userId: result.insertId }`
- **Error response:** `500 { error: err.message }`

### Route 2: User login
```
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  ...
});
```

- **Endpoint:** `POST /auth/login`
- **Purpose:** Authenticate user and return a JWT token.
- **Steps:**
    - Looks up the user by email.
    - If no user found → returns `400 { error: 'User not found' }`.
    - If found, compares entered password with stored `PasswordHash` using bcrypt.
    - If password invalid → returns `400 { error: 'Invalid password' }`.
    - If valid → generates a JWT with payload `{ id, role }`, expires in 1 hour.

```
const token = jwt.sign(
  { id: user.UserID, role: user.Role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```


- **Success response:** `{ token, role: user.Role }`
- **Error response:** `500 { error: err.message }`

### Exports
```
module.exports = router;
```

- Exports the authentication router to be mounted in `server.js` at `/auth`.

>**Summary:**\
This file provides authentication endpoints. `/auth/register` lets new customers sign up with hashed passwords stored in the database. `/auth/login` checks credentials and issues a JWT token (valid for 1 hour), which clients can use for authorized requests.