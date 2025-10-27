import pool from '../config/database.js';

// Create a match between two users
export const createMatch = async (user1Id, user2Id) => {
  const result = await pool.query(
    'INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
    [user1Id, user2Id]
  );
  return result.rows[0];
};

// Check if match exists between two users
export const matchExists = async (user1Id, user2Id) => {
  const result = await pool.query(
    `SELECT * FROM matches
     WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
    [user1Id, user2Id]
  );
  return result.rows.length > 0;
};

// Get all matches for a user
export const getUserMatches = async (userId) => {
  const result = await pool.query(
    `SELECT
       m.id as match_id,
       m.created_at,
       CASE
         WHEN m.user1_id = $1 THEN m.user2_id
         ELSE m.user1_id
       END as matched_user_id
     FROM matches m
     WHERE m.user1_id = $1 OR m.user2_id = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );

  // For each match, get the matched user details and last message
  const matches = await Promise.all(
    result.rows.map(async (match) => {
      // Get matched user details
      const userResult = await pool.query(
        'SELECT id, name, age, photo_url FROM users WHERE id = $1',
        [match.matched_user_id]
      );

      // Get last message
      const messageResult = await pool.query(
        `SELECT content, created_at, sender_id
         FROM messages
         WHERE match_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [match.match_id]
      );

      // Get unread message count for this user
      const unreadResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM messages
         WHERE match_id = $1
           AND sender_id != $2
           AND is_read = false`,
        [match.match_id, userId]
      );

      return {
        match_id: match.match_id,
        user: userResult.rows[0],
        last_message: messageResult.rows[0] || null,
        unread_count: parseInt(unreadResult.rows[0].count),
        created_at: match.created_at
      };
    })
  );

  // Sort by most recent message
  matches.sort((a, b) => {
    const aTime = a.last_message?.created_at || a.created_at;
    const bTime = b.last_message?.created_at || b.created_at;
    return new Date(bTime) - new Date(aTime);
  });

  return matches;
};

// Get specific match details
export const getMatchById = async (matchId, userId) => {
  const result = await pool.query(
    `SELECT
       m.id as match_id,
       m.created_at,
       CASE
         WHEN m.user1_id = $2 THEN m.user2_id
         ELSE m.user1_id
       END as matched_user_id
     FROM matches m
     WHERE m.id = $1 AND (m.user1_id = $2 OR m.user2_id = $2)`,
    [matchId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const match = result.rows[0];

  // Get matched user details with interests
  const userResult = await pool.query(
    'SELECT id, name, age, bio, photo_url, custom_interests FROM users WHERE id = $1',
    [match.matched_user_id]
  );

  // Get user's interest tags
  const tagsResult = await pool.query(
    `SELECT it.id, it.name
     FROM interest_tags it
     JOIN user_interest_tags uit ON it.id = uit.interest_tag_id
     WHERE uit.user_id = $1`,
    [match.matched_user_id]
  );

  const user = userResult.rows[0];
  user.interest_tags = tagsResult.rows;

  return {
    match_id: match.match_id,
    user,
    created_at: match.created_at
  };
};

// Check if user is part of a match
export const isUserInMatch = async (matchId, userId) => {
  const result = await pool.query(
    'SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
    [matchId, userId]
  );
  return result.rows.length > 0;
};
