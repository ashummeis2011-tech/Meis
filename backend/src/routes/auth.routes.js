import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRegistration, validateLogin } from '../middleware/validation.middleware.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, register);

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login);

// GET /api/auth/me - Get current authenticated user
router.get('/me', authenticateToken, getCurrentUser);

export default router;
