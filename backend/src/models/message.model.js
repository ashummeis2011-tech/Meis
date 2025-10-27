import pool from '../config/database.js';

// Create a new message
export const createMessage = async (matchId, senderId, messageType, content) => {
  const result = await pool.query(
    'INSERT INTO messages (match_id, sender_id, message_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [matchId, senderId, messageType, content]
  );
  return result.rows[0];
};

// Get messages for a match
export const getMessagesByMatch = async (matchId, limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT
       m.id,
       m.match_id,
       m.sender_id,
       u.name as sender_name,
       m.message_type,
       m.content,
       m.is_read,
       m.created_at
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.match_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2 OFFSET $3`,
    [matchId, limit, offset]
  );

  return result.rows;
};

// Get total message count for a match
export const getMessageCount = async (matchId) => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM messages WHERE match_id = $1',
    [matchId]
  );
  return parseInt(result.rows[0].count);
};

// Mark messages as read
export const markMessagesAsRead = async (matchId, userId) => {
  await pool.query(
    'UPDATE messages SET is_read = true WHERE match_id = $1 AND sender_id != $2 AND is_read = false',
    [matchId, userId]
  );
};

// Get unread count for a user in a match
export const getUnreadCount = async (matchId, userId) => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM messages WHERE match_id = $1 AND sender_id != $2 AND is_read = false',
    [matchId, userId]
  );
  return parseInt(result.rows[0].count);
};
