import {
  createMessage,
  markMessagesAsRead
} from '../models/message.model.js';
import { isUserInMatch } from '../models/match.model.js';
import { findUserById } from '../models/user.model.js';
import { sendToUser } from './socket.js';

export const chatHandlers = (io, socket) => {
  const userId = socket.userId;

  // Join a match room
  socket.on('join_match', async ({ match_id }) => {
    try {
      // Verify user is part of this match
      const isInMatch = await isUserInMatch(match_id, userId);
      if (!isInMatch) {
        socket.emit('error', { message: 'Not authorized to join this match' });
        return;
      }

      const roomName = `match_${match_id}`;
      socket.join(roomName);
      console.log(`User ${userId} joined match room: ${roomName}`);

      // Mark messages as read when joining
      await markMessagesAsRead(match_id, userId);
    } catch (error) {
      console.error('Join match error:', error);
      socket.emit('error', { message: 'Failed to join match' });
    }
  });

  // Leave a match room
  socket.on('leave_match', ({ match_id }) => {
    const roomName = `match_${match_id}`;
    socket.leave(roomName);
    console.log(`User ${userId} left match room: ${roomName}`);
  });

  // Send message via WebSocket (alternative to HTTP POST)
  socket.on('send_message', async ({ match_id, message_type, content }) => {
    try {
      // Verify user is part of this match
      const isInMatch = await isUserInMatch(match_id, userId);
      if (!isInMatch) {
        socket.emit('error', { message: 'Not part of this match' });
        return;
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        socket.emit('error', { message: 'Content cannot be empty' });
        return;
      }

      if (content.length > 1000) {
        socket.emit('error', { message: 'Content too long' });
        return;
      }

      // Create message
      const message = await createMessage(match_id, userId, message_type, content);

      // Get sender info
      const user = await findUserById(userId);

      const messageData = {
        id: message.id,
        match_id: message.match_id,
        sender_id: message.sender_id,
        sender_name: user.name,
        message_type: message.message_type,
        content: message.content,
        created_at: message.created_at
      };

      // Broadcast to match room
      const roomName = `match_${match_id}`;
      io.to(roomName).emit('new_message', messageData);

      console.log(`Message sent in match ${match_id} by user ${userId}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};

// Helper function to broadcast match creation to users
export const broadcastNewMatch = (io, user1Id, user2Id, matchData) => {
  // Send to user1
  sendToUser(io, user1Id, 'new_match', {
    match_id: matchData.match_id,
    user: matchData.user2
  });

  // Send to user2
  sendToUser(io, user2Id, 'new_match', {
    match_id: matchData.match_id,
    user: matchData.user1
  });
};
