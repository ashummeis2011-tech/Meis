import express from 'express';
import { getMatches, getMatch } from '../controllers/match.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/matches - Get all matches for current user
router.get('/', authenticateToken, getMatches);

// GET /api/matches/:matchId - Get specific match details
router.get('/:matchId', authenticateToken, getMatch);

export default router;
