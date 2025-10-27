import { getUserMatches, getMatchById } from '../models/match.model.js';

// Get all matches for current user
export const getMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const matches = await getUserMatches(userId);

    res.json({ matches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Get specific match details
export const getMatch = async (req, res) => {
  try {
    const userId = req.userId;
    const matchId = parseInt(req.params.matchId);

    const match = await getMatchById(matchId, userId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
};
