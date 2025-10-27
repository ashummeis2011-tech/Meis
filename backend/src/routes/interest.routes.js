import express from 'express';
import { getAllInterestTags } from '../models/interestTag.model.js';

const router = express.Router();

// GET /api/interests - Get all interest tags
router.get('/', async (req, res) => {
  try {
    const interests = await getAllInterestTags();
    res.json({ interests });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Failed to get interests' });
  }
});

export default router;
