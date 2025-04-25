const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authorize = require('../middleware/authorize');

// Public routes
router.post('/authenticate', accountController.authenticate);
router.post('/refresh-token', accountController.refreshToken);
router.post('/register', accountController.register);
router.post('/verify-email', accountController.verifyEmail);
router.post('/forgot-password', accountController.forgotPassword);
router.post('/validate-reset-token', accountController.validateResetToken);
router.post('/reset-password', accountController.resetPassword);

// Protected routes
router.post('/revoke-token', authorize(), accountController.revokeToken);
router.get('/', authorize('Admin'), accountController.getAll);
router.get('/:id', authorize(), accountController.getById);
router.post('/', authorize('Admin'), accountController.create);
router.put('/:id', authorize(), accountController.update);
router.delete('/:id', authorize(), accountController.delete);

module.exports = router; 