const express = require('express');
const accountService = require('../services/account.service');

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
  setUserActive
};

function authenticate(req, res, next) {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  accountService.authenticate({ email, password, ipAddress })
    .then(account => {
      setTokenCookie(res, account.refreshToken);
      res.json(account);
    })
    .catch(next);
}

function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken || req.body.token;
  const ipAddress = req.ip;

  // Return error if token is missing
  if (!token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  accountService.refreshToken({ token, ipAddress })
    .then(account => {
      // Check if account and refreshToken exist before setting cookie
      if (account && account.refreshToken) {
        setTokenCookie(res, account.refreshToken);
        res.json(account);
      } else {
        // If account exists but has no refreshToken
        res.status(400).json({ message: 'Invalid refresh token' });
      }
    })
    .catch(next);
}

function revokeToken(req, res, next) {
  const token = req.cookies.refreshToken || req.body.token;
  const ipAddress = req.ip;

  if (!token) return res.status(400).json({ message: 'Token is required' });

  // Users can revoke their own tokens and admins can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== 'Admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  accountService.revokeToken({ token, ipAddress })
    .then(() => res.json({ message: 'Token revoked' }))
    .catch(next);
}

function register(req, res, next) {
  accountService.register(req.body, req.get('origin'))
    .then(account => res.json(account))
    .catch(next);
}

function verifyEmail(req, res, next) {
  accountService.verifyEmail(req.body)
    .then(() => res.json({ message: 'Verification successful, you can now login' }))
    .catch(next);
}

function forgotPassword(req, res, next) {
  accountService.forgotPassword(req.body, req.get('origin'))
    .then(response => res.json(response))
    .catch(next);
}

function validateResetToken(req, res, next) {
  accountService.validateResetToken(req.body)
    .then(response => res.json(response))
    .catch(next);
}

function resetPassword(req, res, next) {
  accountService.resetPassword(req.body)
    .then(response => res.json(response))
    .catch(next);
}

function getAll(req, res, next) {
  accountService.getAll()
    .then(accounts => res.json(accounts))
    .catch(next);
}

function getById(req, res, next) {
  // Users can get their own account and admins can get any account
  if (req.params.id !== req.user.id && req.user.role !== 'Admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  accountService.getById(req.params.id)
    .then(account => account ? res.json(account) : res.sendStatus(404))
    .catch(next);
}

function create(req, res, next) {
  accountService.create(req.body)
    .then(account => res.json(account))
    .catch(next);
}

function update(req, res, next) {
  // Users can update their own account and admins can update any account
  if (req.params.id !== req.user.id && req.user.role !== 'Admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  accountService.update(req.params.id, req.body)
    .then(account => res.json(account))
    .catch(next);
}

function setUserActive(req, res, next) {
  // Only admins can set user active status
  if (req.user.role !== 'Admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const isActive = req.body.active;
  
  // Validate the active parameter
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'Active status must be a boolean value' });
  }

  accountService.setUserActive(req.params.id, isActive)
    .then(account => res.json({ 
      ...account, 
      message: `Account ${isActive ? 'activated' : 'deactivated'} successfully` 
    }))
    .catch(next);
}

// Helper functions

function setTokenCookie(res, token) {
  // Create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie('refreshToken', token, cookieOptions);
} 