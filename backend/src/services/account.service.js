const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
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
  const user = await User.findOne({ email });

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
  const refreshToken = await getRefreshToken(token);
  const user = await User.findById(refreshToken.user);

  // Replace old refresh token with a new one and save
  const newRefreshToken = await generateRefreshToken(user, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();

  // Generate new jwt
  const jwtToken = generateJwtToken(user);

  // Return basic user info and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: newRefreshToken.token
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // Revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function register(params, origin) {
  // Validate
  if (await User.findOne({ email: params.email })) {
    // Send already registered email if user exists but isn't verified
    const user = await User.findOne({ email: params.email });
    if (!user.isVerified) {
      await sendAlreadyRegisteredEmail(user, origin);
    }

    // Return "email already registered" error
    return { message: 'Email already registered' };
  }

  // Create user object
  const user = new User({
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    passwordHash: bcrypt.hashSync(params.password, 10),
    role: params.role || 'User',
    verificationToken: randomTokenString(),
  });

  // Save user
  await user.save();

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
  const user = await User.findOne({ verificationToken: token });

  if (!user) throw 'Verification failed';

  user.verified = Date.now();
  user.verificationToken = undefined;
  await user.save();
}

async function forgotPassword({ email }, origin) {
  const user = await User.findOne({ email });

  // Always return ok response to prevent email enumeration
  if (!user) return { message: 'Email sent with password reset instructions' };

  // Create reset token that expires after 24 hours
  user.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
  await user.save();

  // Send password reset email
  const emailResponse = await sendPasswordResetEmail(user, origin);
  
  return {
    message: 'Email sent with password reset instructions',
    emailPreview: emailResponse.previewUrl,
    etherealUser: emailResponse.etherealUser,
    etherealPass: emailResponse.etherealPass
  };
}

async function validateResetToken({ token }) {
  const user = await User.findOne({
    'resetToken.token': token,
    'resetToken.expires': { $gt: Date.now() }
  });

  if (!user) throw 'Invalid token';
  
  return { message: 'Token is valid' };
}

async function resetPassword({ token, password }) {
  const user = await User.findOne({
    'resetToken.token': token,
    'resetToken.expires': { $gt: Date.now() }
  });

  if (!user) throw 'Invalid token';

  // Update password and remove reset token
  user.passwordHash = bcrypt.hashSync(password, 10);
  user.passwordReset = Date.now();
  user.resetToken = undefined;
  await user.save();
  
  // Send password changed confirmation email
  const emailResponse = await emailService.sendPasswordChangedEmail(user.email);
  
  return {
    message: 'Password reset successful, you can now login',
    emailPreview: emailResponse.previewUrl
  };
}

async function getAll() {
  const users = await User.find();
  return users.map(x => basicDetails(x));
}

async function getById(id) {
  const user = await getUser(id);
  return basicDetails(user);
}

async function create(params) {
  // Validate
  if (await User.findOne({ email: params.email })) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const user = new User(params);
  user.passwordHash = bcrypt.hashSync(params.password, 10);
  user.verified = Date.now();

  // Save user
  await user.save();

  return basicDetails(user);
}

async function update(id, params) {
  const user = await getUser(id);

  // Validate email if changing
  if (params.email && user.email !== params.email && await User.findOne({ email: params.email })) {
    throw 'Email "' + params.email + '" is already taken';
  }

  // Hash password if it was entered
  if (params.password) {
    params.passwordHash = bcrypt.hashSync(params.password, 10);
  }

  // Copy params to user and save
  Object.assign(user, params);
  user.updated = Date.now();
  await user.save();

  return basicDetails(user);
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}

// Helper functions

async function getUser(id) {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw 'User not found';
  }
  const user = await User.findById(id);
  if (!user) throw 'User not found';
  return user;
}

async function getRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({ token });
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
}

function generateJwtToken(user) {
  // Create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.id, id: user.id }, config.jwt.secret, { expiresIn: '15m' });
}

async function generateRefreshToken(user, ipAddress) {
  // Create a refresh token that expires in 7 days
  const token = randomTokenString();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const refreshToken = new RefreshToken({
    user: user.id,
    token,
    expires,
    createdByIp: ipAddress
  });

  await refreshToken.save();

  return refreshToken;
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