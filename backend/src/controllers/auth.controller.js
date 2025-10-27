import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import {
  createUser,
  findUserByEmail,
  reactivateUser
} from '../models/user.model.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(email, passwordHash);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Account created successfully',
      userId: user.id,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reactivate user if deactivated
    if (!user.is_active) {
      await reactivateUser(user.id);
      user.is_active = true;
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        profile_completed: user.profile_completed,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      profile_completed: user.profile_completed,
      is_active: user.is_active
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};
