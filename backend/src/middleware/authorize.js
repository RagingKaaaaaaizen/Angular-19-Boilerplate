const { expressjwt: jwt } = require('express-jwt');
const config = require('../config/config');
const db = require('../services/json-db.service');

module.exports = authorize;

function authorize(roles = []) {
  // Roles param can be a single role string or an array of roles
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // Authenticate JWT token and attach decoded token to request as req.user
    jwt({ secret: config.jwt.secret, algorithms: ['HS256'] }),

    // Attach full user object to request
    (req, res, next) => {
      // Add user to request object
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = db.getUserById(req.user.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = user;
      
      // Add helper method to check if token is owned by user
      req.user.ownsToken = function(token) {
        if (!token) return false;
        
        const refreshTokens = db.getRefreshTokens();
        return refreshTokens.some(rt => 
          rt.token === token && 
          rt.user === req.user.id &&
          !rt.revoked
        );
      };
      
      next();
    },

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