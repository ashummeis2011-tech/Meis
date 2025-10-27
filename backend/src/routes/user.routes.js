import express from 'express';
import {
  setupProfile,
  getProfile,
  updateProfile,
  changeEmail,
  changePassword,
  deactivateAccount,
  deleteAccount
} from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  validateProfileSetup,
  validateEmailUpdate,
  validatePasswordUpdate
} from '../middleware/validation.middleware.js';
import {
  uploadProfilePhoto,
  handleUploadError
} from '../middleware/upload.middleware.js';

const router = express.Router();

// POST /api/users/profile/setup - Complete profile after registration
router.post(
  '/profile/setup',
  authenticateToken,
  (req, res, next) => {
    uploadProfilePhoto(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  validateProfileSetup,
  setupProfile
);

// GET /api/users/profile - Get own profile
router.get('/profile', authenticateToken, getProfile);

// PUT /api/users/profile - Update profile
router.put(
  '/profile',
  authenticateToken,
  (req, res, next) => {
    uploadProfilePhoto(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  updateProfile
);

// PUT /api/users/email - Change email
router.put('/email', authenticateToken, validateEmailUpdate, changeEmail);

// PUT /api/users/password - Change password
router.put('/password', authenticateToken, validatePasswordUpdate, changePassword);

// PUT /api/users/deactivate - Deactivate account
router.put('/deactivate', authenticateToken, deactivateAccount);

// DELETE /api/users/account - Delete account
router.delete('/account', authenticateToken, deleteAccount);

export default router;
