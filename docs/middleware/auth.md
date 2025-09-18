### Imports JWT library:

```
const jwt = require('jsonwebtoken');
```
- `jsonwebtoken` is used to create and verify JSON Web Tokens (JWTs) for authentication.

### Defines an `authorize` middleware:

```
function authorize(roles = []) {
  return (req, res, next) => { ... }
}
```

- This is a higher-order function that returns middleware for Express.
- `roles` → an optional array of roles allowed to access a route (e.g., `['admin', 'customer']`).

### Extracts token from headers:

```
const token = req.headers['authorization']?.split(' ')[1];
if (!token) return res.sendStatus(401);
```

- Looks for the JWT in the `Authorization` header (`Bearer <token>`).
- If there’s no token → sends 401 Unauthorized.

### Verifies the token:
```
jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... });
```

- Checks if the token is valid using a secret key (`JWT_SECRET`).
- If invalid → sends 403 Forbidden.

### Checks user role:
```
if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);
```
- If the route specifies roles and the user’s role isn’t allowed → sends 403 Forbidden.

### Attaches user to request & calls next middleware:
```
req.user = user;
next();
```

- Saves the decoded user info (from JWT) in `req.user` so downstream route handlers can access it.
- Calls `next()` to continue processing the request.

### Exports the middleware:
```
module.exports = authorize;
```
- Other route files can use it like:
```
app.use('/admin', authorize(['admin']), adminRoutes);
```

>**Summary:**\
This code creates a middleware that protects routes by checking for a valid JWT and optionally enforcing role-based access. If the token is missing, invalid, or the user doesn’t have the right role, it blocks access. Otherwise, it passes control to the next middleware.