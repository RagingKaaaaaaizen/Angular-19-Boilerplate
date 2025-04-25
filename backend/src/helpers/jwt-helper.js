const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = {
  generateToken,
  verifyToken
};

function generateToken(userId, secret = config.jwt.secret, expiresIn = '15m') {
  return jwt.sign({ sub: userId, id: userId }, secret, { expiresIn });
}

function verifyToken(token, secret = config.jwt.secret) {
  return jwt.verify(token, secret);
} 