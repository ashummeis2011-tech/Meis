import {
  createMessage,
  getMessagesByMatch,
  getMessageCount,
  markMessagesAsRead
} from '../models/message.model.js';
import { isUserInMatch } from '../models/match.model.js';
import { findUserById } from '../models/user.model.js';

// Get messages for a match
export const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const matchId = parseInt(req.params.matchId);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Check if user is part of this match
    const isInMatch = await isUserInMatch(matchId, userId);
    if (!isInMatch) {
      return res.status(403).json({ error: 'Not authorized to view these messages' });
    }

    // Get messages
    const messages = await getMessagesByMatch(matchId, limit, offset);

    // Get total count
    const total = await getMessageCount(matchId);

    // Mark messages as read
    await markMessagesAsRead(matchId, userId);

    res.json({ messages, total });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Send text/emoji message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { match_id, message_type, content } = req.body;

    // Check if user is part of this match
    const isInMatch = await isUserInMatch(match_id, userId);
    if (!isInMatch) {
      return res.status(403).json({ error: 'Not part of this match' });
    }

    // Create message
    const message = await createMessage(match_id, userId, message_type, content);

    // Get sender name
    const user = await findUserById(userId);

    const messageResponse = {
      id: message.id,
      match_id: message.match_id,
      sender_id: message.sender_id,
      sender_name: user.name,
      message_type: message.message_type,
      content: message.content,
      created_at: message.created_at
    };

    // TODO: Broadcast via WebSocket
    // This will be handled by socket handlers

    res.status(201).json({ message: messageResponse });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Send image message
export const sendImageMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const matchId = parseInt(req.body.match_id);

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Check if user is part of this match
    const isInMatch = await isUserInMatch(matchId, userId);
    if (!isInMatch) {
      return res.status(403).json({ error: 'Not part of this match' });
    }

    const imageUrl = `/uploads/messages/${req.file.filename}`;

    // Create message
    const message = await createMessage(matchId, userId, 'image', imageUrl);

    // Get sender name
    const user = await findUserById(userId);

    const messageResponse = {
      id: message.id,
      match_id: message.match_id,
      sender_id: message.sender_id,
      sender_name: user.name,
      message_type: 'image',
      content: imageUrl,
      created_at: message.created_at
    };

    // TODO: Broadcast via WebSocket

    res.status(201).json({ message: messageResponse });
  } catch (error) {
    console.error('Send image message error:', error);
    res.status(500).json({ error: 'Failed to send image message' });
  }
};
