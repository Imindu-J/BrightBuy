const jwt = require('jsonwebtoken');

function authorize(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      // Check role (handle both lowercase and uppercase)
      const userRole = user.role || user.Role;
      if (roles.length && !roles.includes(userRole)) {
        console.error('Role check failed:', { userRole, requiredRoles: roles });
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }

      req.user = user;
      next();
    });
  };
}

module.exports = authorize;
