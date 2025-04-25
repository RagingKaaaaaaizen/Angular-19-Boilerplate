const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./json-db.service');
const emailService = require('./email.service');
const config = require('../config/config');

module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
  const user = db.getUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw 'Email or password is incorrect';
  }

  // Authentication successful
  const jwtToken = generateJwtToken(user);
  const refreshToken = await generateRefreshToken(user, ipAddress);

  // Return basic user info and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: refreshToken.token
  };
}

async function refreshToken({ token, ipAddress }) {
  if (!token) {
    throw 'Token is required';
  }
  
  try {
    const refreshToken = db.getRefreshTokenByToken(token);
    
    // Validate refresh token
    if (!refreshToken) {
      throw 'Invalid token';
    }
    
    // Check if token is expired or revoked
    if (refreshToken.revoked) {
      throw 'Token has been revoked';
    }
    
    // Ensure token hasn't expired
    const refreshTokenExpiry = new Date(refreshToken.expires);
    if (refreshTokenExpiry < new Date()) {
      throw 'Token has expired';
    }
    
    const user = db.getUserById(refreshToken.user);
    if (!user) {
      throw 'Unknown user';
    }
    
    // Replace old refresh token with a new one
    const newRefreshToken = await generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    db.updateRefreshToken(refreshToken.token, refreshToken);
    
    // Generate new jwt
    const jwtToken = generateJwtToken(user);
    
    // Return basic details and tokens
    return {
      ...basicDetails(user),
      jwtToken,
      refreshToken: newRefreshToken.token
    };
  } catch (error) {
    // Log the error for debugging
    console.error('Refresh token error:', error);
    throw error;
  }
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // Revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  db.updateRefreshToken(refreshToken.token, refreshToken);
}

async function register(params, origin) {
  // Validate
  if (db.getUserByEmail(params.email)) {
    // Send already registered email if user exists but isn't verified
    const user = db.getUserByEmail(params.email);
    if (!user.isVerified) {
      await sendAlreadyRegisteredEmail(user, origin);
    }

    // Return "email already registered" error
    return { message: 'Email already registered' };
  }

  // Create user object
  const user = {
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    passwordHash: bcrypt.hashSync(params.password, 10),
    role: params.role || 'User',
    verificationToken: randomTokenString(),
  };

  // Save user
  db.createUser(user);

  // Send verification email
  const emailResponse = await sendVerificationEmail(user, origin);
  
  return {
    message: 'Registration successful, please check your email for verification instructions',
    emailPreview: emailResponse.previewUrl,
    etherealUser: emailResponse.etherealUser,
    etherealPass: emailResponse.etherealPass
  };
}

async function verifyEmail({ token }) {
  const user = db.getUserByVerificationToken(token);

  if (!user) throw 'Verification failed';

  // Update user
  db.updateUser(user.id, {
    verified: Date.now(),
    verificationToken: undefined
  });
}

async function forgotPassword({ email }, origin) {
  const user = db.getUserByEmail(email);

  // Always return ok response to prevent email enumeration
  if (!user) return { message: 'Email sent with password reset instructions' };

  // Create reset token that expires after 24 hours
  const resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
  
  try {
    // Update user with reset token
    const updatedUser = db.updateUser(user.id, { resetToken });
    
    if (!updatedUser) {
      throw new Error('Failed to update user with reset token');
    }

    // Send password reset email
    const emailResponse = await sendPasswordResetEmail(updatedUser, origin);
    
    return {
      message: 'Email sent with password reset instructions',
      emailPreview: emailResponse.previewUrl,
      etherealUser: emailResponse.etherealUser,
      etherealPass: emailResponse.etherealPass
    };
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    throw error;
  }
}

async function validateResetToken({ token }) {
  const user = db.getUserByResetToken(token);

  if (!user || user.resetToken.expires < new Date()) throw 'Invalid token';
  
  return { message: 'Token is valid' };
}

async function resetPassword({ token, password }) {
  const user = db.getUserByResetToken(token);

  if (!user || user.resetToken.expires < new Date()) throw 'Invalid token';

  // Update password and remove reset token
  db.updateUser(user.id, {
    passwordHash: bcrypt.hashSync(password, 10),
    passwordReset: Date.now(),
    resetToken: undefined
  });
  
  // Send password changed confirmation email
  const emailResponse = await emailService.sendPasswordChangedEmail(user.email);
  
  return {
    message: 'Password reset successful, you can now login',
    emailPreview: emailResponse.previewUrl
  };
}

async function getAll() {
  const users = db.getUsers();
  return users.map(x => basicDetails(x));
}

async function getById(id) {
  const user = getUser(id);
  return basicDetails(user);
}

async function create(params) {
  // Validate
  if (db.getUserByEmail(params.email)) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const user = {
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    passwordHash: bcrypt.hashSync(params.password, 10),
    role: params.role || 'User',
    verified: Date.now()
  };

  // Save user
  return basicDetails(db.createUser(user));
}

async function update(id, params) {
  const user = getUser(id);

  // Validate email if changing
  if (params.email && user.email !== params.email && db.getUserByEmail(params.email)) {
    throw 'Email "' + params.email + '" is already taken';
  }

  // Hash password if it was entered
  if (params.password) {
    params.passwordHash = bcrypt.hashSync(params.password, 10);
    delete params.password;
  }

  // Update user
  const updatedUser = db.updateUser(id, params);
  return basicDetails(updatedUser);
}

async function _delete(id) {
  db.deleteUser(id);
}

// Helper functions

function getUser(id) {
  const user = db.getUserById(id);
  if (!user) throw 'User not found';
  return user;
}

async function getRefreshToken(token) {
  const refreshToken = db.getRefreshTokenByToken(token);
  if (!refreshToken || refreshToken.revoked) throw 'Invalid token';
  return refreshToken;
}

function generateJwtToken(user) {
  // Create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.id, id: user.id }, config.jwt.secret, { expiresIn: '15m' });
}

async function generateRefreshToken(user, ipAddress) {
  // Create a refresh token that expires in 7 days
  const refreshToken = {
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  };

  // Save refresh token
  return db.createRefreshToken(refreshToken);
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function basicDetails(user) {
  const { id, firstName, lastName, email, role, created, updated, isVerified } = user;
  return { id, firstName, lastName, email, role, created, updated, isVerified };
}

async function sendVerificationEmail(user, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${user.verificationToken}`;
    message = `<p>Please click the below link to verify your email address:</p>
                 <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                 <p><code>${user.verificationToken}</code></p>`;
  }

  return await emailService.sendVerificationEmail(user.email, user.verificationToken);
}

async function sendAlreadyRegisteredEmail(user, origin) {
  return await emailService.sendAlreadyRegisteredEmail(user.email, user.verificationToken);
}

async function sendPasswordResetEmail(user, origin) {
  return await emailService.sendPasswordResetEmail(user.email, user.resetToken.token);
} 