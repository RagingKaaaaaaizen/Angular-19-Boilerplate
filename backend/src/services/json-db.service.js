const fs = require('fs-extra');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
fs.ensureDirSync(dataDir);

// Define paths for the JSON files
const usersPath = path.join(dataDir, 'users.json');
const refreshTokensPath = path.join(dataDir, 'refresh-tokens.json');

// Initialize JSON files if they don't exist
if (!fs.existsSync(usersPath)) {
  fs.writeJsonSync(usersPath, []);
}

if (!fs.existsSync(refreshTokensPath)) {
  fs.writeJsonSync(refreshTokensPath, []);
}

// Helper functions to read and write data
function readData(filePath) {
  return fs.readJsonSync(filePath);
}

function writeData(filePath, data) {
  fs.writeJsonSync(filePath, data, { spaces: 2 });
}

// User CRUD operations
function getUsers() {
  return readData(usersPath);
}

function getUserById(id) {
  const users = getUsers();
  return users.find(user => user.id === id);
}

function getUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email === email);
}

function getUserByVerificationToken(token) {
  const users = getUsers();
  return users.find(user => user.verificationToken === token);
}

function getUserByResetToken(token) {
  const users = getUsers();
  return users.find(user => user.resetToken && user.resetToken.token === token);
}

function createUser(user) {
  const users = getUsers();
  // Generate a unique ID if one doesn't exist
  user.id = user.id || Date.now().toString();
  // Add created date
  user.created = Date.now();
  
  users.push(user);
  writeData(usersPath, users);
  return user;
}

function updateUser(id, updatedFields) {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedFields, updated: Date.now() };
    writeData(usersPath, users);
    return users[index];
  }
  return null;
}

function deleteUser(id) {
  const users = getUsers();
  const filtered = users.filter(user => user.id !== id);
  
  if (filtered.length < users.length) {
    writeData(usersPath, filtered);
    return true;
  }
  return false;
}

// Refresh Token CRUD operations
function getRefreshTokens() {
  return readData(refreshTokensPath);
}

function getRefreshTokenByToken(token) {
  const tokens = getRefreshTokens();
  return tokens.find(t => t.token === token);
}

function createRefreshToken(token) {
  const tokens = getRefreshTokens();
  // Generate a unique ID if one doesn't exist
  token.id = token.id || Date.now().toString();
  
  tokens.push(token);
  writeData(refreshTokensPath, tokens);
  return token;
}

function updateRefreshToken(token, updatedFields) {
  const tokens = getRefreshTokens();
  const index = tokens.findIndex(t => t.token === token);
  
  if (index !== -1) {
    tokens[index] = { ...tokens[index], ...updatedFields };
    writeData(refreshTokensPath, tokens);
    return tokens[index];
  }
  return null;
}

module.exports = {
  // User methods
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByVerificationToken, 
  getUserByResetToken,
  createUser,
  updateUser,
  deleteUser,
  
  // Refresh token methods
  getRefreshTokens,
  getRefreshTokenByToken,
  createRefreshToken,
  updateRefreshToken
}; 