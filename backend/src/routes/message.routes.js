import express from 'express';
import {
  getMessages,
  sendMessage,
  sendImageMessage
} from '../controllers/message.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateMessage } from '../middleware/validation.middleware.js';
import {
  uploadMessageImage,
  handleUploadError
} from '../middleware/upload.middleware.js';

const router = express.Router();

// GET /api/messages/:matchId - Get messages for a match
router.get('/:matchId', authenticateToken, getMessages);

// POST /api/messages - Send text/emoji message
router.post('/', authenticateToken, validateMessage, sendMessage);

// POST /api/messages/image - Send image message
router.post(
  '/image',
  authenticateToken,
  (req, res, next) => {
    uploadMessageImage(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  sendImageMessage
);

export default router;
