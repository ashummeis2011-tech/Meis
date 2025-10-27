import { body, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Profile setup validation
export const validateProfileSetup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('age')
    .isInt({ min: 13, max: 20 })
    .withMessage('Age must be between 13 and 20'),
  body('bio')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Bio must be between 10 and 500 characters'),
  handleValidationErrors
];

// Swipe validation
export const validateSwipe = [
  body('swiped_user_id').isUUID().withMessage('Valid user ID is required'),
  body('direction')
    .isIn(['left', 'right'])
    .withMessage('Direction must be left or right'),
  handleValidationErrors
];

// Message validation
export const validateMessage = [
  body('match_id').isInt().withMessage('Valid match ID is required'),
  body('message_type')
    .isIn(['text', 'emoji'])
    .withMessage('Message type must be text or emoji'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Content cannot exceed 1000 characters'),
  handleValidationErrors
];

// Email update validation
export const validateEmailUpdate = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid new email is required'),
  handleValidationErrors
];

// Password update validation
export const validatePasswordUpdate = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  body('confirm_password')
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage('Passwords do not match'),
  handleValidationErrors
];
