import pool from '../config/database.js';

// Create a swipe
export const createSwipe = async (swiperUserId, swipedUserId, direction) => {
  const result = await pool.query(
    'INSERT INTO swipes (swiper_user_id, swiped_user_id, direction) VALUES ($1, $2, $3) RETURNING *',
    [swiperUserId, swipedUserId, direction]
  );
  return result.rows[0];
};

// Check if user has already swiped on another user
export const hasSwipedOn = async (swiperUserId, swipedUserId) => {
  const result = await pool.query(
    'SELECT * FROM swipes WHERE swiper_user_id = $1 AND swiped_user_id = $2',
    [swiperUserId, swipedUserId]
  );
  return result.rows.length > 0;
};

// Get swipe between two users
export const getSwipeBetween = async (user1Id, user2Id) => {
  const result = await pool.query(
    'SELECT * FROM swipes WHERE swiper_user_id = $1 AND swiped_user_id = $2',
    [user1Id, user2Id]
  );
  return result.rows[0];
};

// Check if two users have mutually swiped right
export const checkMutualRightSwipe = async (user1Id, user2Id) => {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM swipes
     WHERE ((swiper_user_id = $1 AND swiped_user_id = $2) OR
            (swiper_user_id = $2 AND swiped_user_id = $1))
     AND direction = 'right'`,
    [user1Id, user2Id]
  );
  return parseInt(result.rows[0].count) === 2;
};

// Get next user to swipe on for a given user
export const getNextUserToSwipe = async (currentUserId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.age, u.bio, u.photo_url, u.custom_interests
     FROM users u
     WHERE u.id != $1
       AND u.profile_completed = true
       AND u.is_active = true
       AND NOT EXISTS (
         SELECT 1 FROM swipes s
         WHERE s.swiper_user_id = $1 AND s.swiped_user_id = u.id
       )
     ORDER BY RANDOM()
     LIMIT 1`,
    [currentUserId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  // Get user's interest tags
  const tagsResult = await pool.query(
    `SELECT it.id, it.name
     FROM interest_tags it
     JOIN user_interest_tags uit ON it.id = uit.interest_tag_id
     WHERE uit.user_id = $1`,
    [user.id]
  );

  user.interest_tags = tagsResult.rows;
  return user;
};
