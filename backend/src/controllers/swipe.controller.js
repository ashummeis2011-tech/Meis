import {
  createSwipe,
  hasSwipedOn,
  getSwipeBetween,
  getNextUserToSwipe
} from '../models/swipe.model.js';
import { createMatch, matchExists } from '../models/match.model.js';
import { getTotalUsersCount, getUserWithInterests } from '../models/user.model.js';

// Get next user to swipe on
export const getNextUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if user has completed profile
    if (!req.user.profile_completed) {
      return res.status(403).json({
        error: 'Profile must be completed before swiping'
      });
    }

    const nextUser = await getNextUserToSwipe(userId);

    if (!nextUser) {
      return res.status(204).send(); // No content - no more users
    }

    res.json({ user: nextUser });
  } catch (error) {
    console.error('Get next user error:', error);
    res.status(500).json({ error: 'Failed to get next user' });
  }
};

// Record a swipe
export const swipe = async (req, res) => {
  try {
    const userId = req.userId;
    const { swiped_user_id, direction } = req.body;

    // Check if already swiped
    const alreadySwiped = await hasSwipedOn(userId, swiped_user_id);
    if (alreadySwiped) {
      return res.status(400).json({ error: 'Already swiped on this user' });
    }

    // Create swipe
    await createSwipe(userId, swiped_user_id, direction);

    // If swiped right, check for mutual match
    if (direction === 'right') {
      // Check if other user has also swiped right on this user
      const otherUserSwipe = await getSwipeBetween(swiped_user_id, userId);

      if (otherUserSwipe && otherUserSwipe.direction === 'right') {
        // Check if match doesn't already exist
        const exists = await matchExists(userId, swiped_user_id);

        if (!exists) {
          // Create match
          const match = await createMatch(userId, swiped_user_id);

          // Get matched user details
          const matchedUser = await getUserWithInterests(swiped_user_id);

          return res.json({
            message: "It's a match!",
            match: true,
            match_id: match.id,
            matched_user: {
              id: matchedUser.id,
              name: matchedUser.name,
              photo_url: matchedUser.photo_url
            }
          });
        }
      }
    }

    // No match
    res.json({
      message: 'Swipe recorded',
      match: false
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
};

// Get total users count (for welcome message)
export const getStats = async (req, res) => {
  try {
    const totalUsers = await getTotalUsersCount();

    res.json({ total_users: totalUsers });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
