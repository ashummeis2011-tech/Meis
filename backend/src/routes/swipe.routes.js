import express from 'express';
import { getNextUser, swipe, getStats } from '../controllers/swipe.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateSwipe } from '../middleware/validation.middleware.js';

const router = express.Router();

// GET /api/swipe/next - Get next user to swipe on
router.get('/next', authenticateToken, getNextUser);

// POST /api/swipe - Record a swipe
router.post('/', authenticateToken, validateSwipe, swipe);

// GET /api/swipe/stats - Get total users count
router.get('/stats', authenticateToken, getStats);

export default router;
