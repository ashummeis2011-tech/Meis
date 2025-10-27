import pool from '../config/database.js';

// Get all interest tags
export const getAllInterestTags = async () => {
  const result = await pool.query(
    'SELECT id, name FROM interest_tags ORDER BY name ASC'
  );
  return result.rows;
};

// Get interest tag by ID
export const getInterestTagById = async (tagId) => {
  const result = await pool.query(
    'SELECT id, name FROM interest_tags WHERE id = $1',
    [tagId]
  );
  return result.rows[0];
};
