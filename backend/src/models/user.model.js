import pool from '../config/database.js';

// Create new user (registration)
export const createUser = async (email, passwordHash) => {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, profile_completed, is_active',
    [email, passwordHash]
  );
  return result.rows[0];
};

// Find user by email
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Find user by ID
export const findUserById = async (userId) => {
  const result = await pool.query(
    'SELECT id, email, name, age, bio, photo_url, custom_interests, is_active, profile_completed, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

// Get user with interest tags
export const getUserWithInterests = async (userId) => {
  const userResult = await pool.query(
    'SELECT id, email, name, age, bio, photo_url, custom_interests, is_active, profile_completed FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Get user's interest tags
  const tagsResult = await pool.query(
    `SELECT it.id, it.name
     FROM interest_tags it
     JOIN user_interest_tags uit ON it.id = uit.interest_tag_id
     WHERE uit.user_id = $1`,
    [userId]
  );

  user.interest_tags = tagsResult.rows;
  return user;
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  const {
    name,
    age,
    bio,
    photo_url,
    custom_interests,
    profile_completed
  } = updates;

  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         age = COALESCE($3, age),
         bio = COALESCE($4, bio),
         photo_url = COALESCE($5, photo_url),
         custom_interests = COALESCE($6, custom_interests),
         profile_completed = COALESCE($7, profile_completed)
     WHERE id = $1
     RETURNING id, email, name, age, bio, photo_url, custom_interests, profile_completed`,
    [userId, name, age, bio, photo_url, custom_interests, profile_completed]
  );

  return result.rows[0];
};

// Update user email
export const updateUserEmail = async (userId, newEmail) => {
  const result = await pool.query(
    'UPDATE users SET email = $2 WHERE id = $1 RETURNING email',
    [userId, newEmail]
  );
  return result.rows[0];
};

// Update user password
export const updateUserPassword = async (userId, newPasswordHash) => {
  await pool.query(
    'UPDATE users SET password_hash = $2 WHERE id = $1',
    [userId, newPasswordHash]
  );
};

// Set user interest tags
export const setUserInterestTags = async (userId, tagIds) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete existing interest tags for user
    await client.query(
      'DELETE FROM user_interest_tags WHERE user_id = $1',
      [userId]
    );

    // Insert new interest tags
    if (tagIds && tagIds.length > 0) {
      const values = tagIds.map((tagId, index) =>
        `($1, $${index + 2})`
      ).join(', ');

      await client.query(
        `INSERT INTO user_interest_tags (user_id, interest_tag_id)
         VALUES ${values}`,
        [userId, ...tagIds]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Deactivate user account
export const deactivateUser = async (userId) => {
  await pool.query(
    'UPDATE users SET is_active = false WHERE id = $1',
    [userId]
  );
};

// Reactivate user account (on login)
export const reactivateUser = async (userId) => {
  await pool.query(
    'UPDATE users SET is_active = true WHERE id = $1',
    [userId]
  );
};

// Delete user account
export const deleteUser = async (userId) => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

// Get total count of users with completed profiles
export const getTotalUsersCount = async () => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE profile_completed = true'
  );
  return parseInt(result.rows[0].count);
};
