import { verifyToken } from '../utils/jwt.js';
import { chatHandlers } from './chat.handler.js';

const connectedUsers = new Map(); // Map of userId -> socket.id

export const initializeSocket = (io) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    socket.userId = decoded.userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store connected user
    connectedUsers.set(socket.userId, socket.id);

    // Register chat handlers
    chatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });

  console.log('✓ Socket.io initialized');
};

// Helper to get socket for a specific user
export const getUserSocket = (io, userId) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    return io.sockets.sockets.get(socketId);
  }
  return null;
};

// Helper to send notification to a user
export const sendToUser = (io, userId, event, data) => {
  const socket = getUserSocket(io, userId);
  if (socket) {
    socket.emit(event, data);
  }
};
