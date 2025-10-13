const jwt = require('jsonwebtoken');

function authorize(roles = []) {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403).json({ error: 'Invalid or expired token' });

      if (roles.length && !roles.includes(user.role)) return res.sendStatus(403);

      req.user = user;
      next();
    });
  };
}

module.exports = authorize;
