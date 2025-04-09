require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  frontend: {
    url: process.env.FRONT_END_URL || 'http://localhost:4200'
  }
}; 