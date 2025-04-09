const { expressjwt: jwt } = require('express-jwt');
const config = require('../config/config');

module.exports = authorize;

function authorize(roles = []) {
  // Roles param can be a single role string or an array of roles
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // Authenticate JWT token and attach decoded token to request as req.user
    jwt({ secret: config.jwt.secret, algorithms: ['HS256'] }),

    // Authorize based on user role
    (req, res, next) => {
      if (roles.length && !roles.includes(req.user.role)) {
        // User's role is not authorized
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Authentication and authorization successful
      next();
    }
  ];
} 