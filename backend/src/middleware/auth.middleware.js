import { verifyToken } from '../utils/jwt.js';
import { findUserById } from '../models/user.model.js';

// Middleware to verify JWT token and attach user to request
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user ID to request
    req.userId = decoded.userId;

    // Optionally fetch full user and attach
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to require profile completion
export const requireProfileComplete = (req, res, next) => {
  if (!req.user || !req.user.profile_completed) {
    return res.status(403).json({
      error: 'Profile must be completed before accessing this feature'
    });
  }
  next();
};
