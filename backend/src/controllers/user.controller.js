import {
  getUserWithInterests,
  updateUserProfile,
  setUserInterestTags,
  updateUserEmail,
  updateUserPassword,
  deactivateUser,
  deleteUser,
  findUserByEmail
} from '../models/user.model.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { deleteFile } from '../utils/fileHelper.js';

// Setup user profile (required after registration)
export const setupProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, age, bio, custom_interests, interest_tag_ids } = req.body;

    // Check if photo was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Profile photo is required' });
    }

    // Validate that at least one interest is provided
    const hasTagInterests = interest_tag_ids && JSON.parse(interest_tag_ids).length > 0;
    const hasCustomInterests = custom_interests && custom_interests.trim().length > 0;

    if (!hasTagInterests && !hasCustomInterests) {
      return res.status(400).json({ error: 'At least one interest is required' });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user profile
    const updatedUser = await updateUserProfile(userId, {
      name,
      age: parseInt(age),
      bio,
      photo_url: photoUrl,
      custom_interests: custom_interests || null,
      profile_completed: true
    });

    // Set interest tags if provided
    if (hasTagInterests) {
      const tagIds = JSON.parse(interest_tag_ids);
      await setUserInterestTags(userId, tagIds);
    }

    // Get updated user with interests
    const user = await getUserWithInterests(userId);

    res.json({
      message: 'Profile setup complete',
      user
    });
  } catch (error) {
    console.error('Setup profile error:', error);
    res.status(500).json({ error: 'Failed to setup profile' });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await getUserWithInterests(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, age, bio, custom_interests, interest_tag_ids } = req.body;

    const updates = {};

    if (name) updates.name = name;
    if (age) updates.age = parseInt(age);
    if (bio) updates.bio = bio;
    if (custom_interests !== undefined) updates.custom_interests = custom_interests || null;

    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      const currentUser = await getUserWithInterests(userId);
      if (currentUser && currentUser.photo_url) {
        await deleteFile(currentUser.photo_url);
      }
      updates.photo_url = `/uploads/profiles/${req.file.filename}`;
    }

    // Update profile
    if (Object.keys(updates).length > 0) {
      await updateUserProfile(userId, updates);
    }

    // Update interest tags if provided
    if (interest_tag_ids) {
      const tagIds = JSON.parse(interest_tag_ids);
      await setUserInterestTags(userId, tagIds);
    }

    // Get updated user with interests
    const user = await getUserWithInterests(userId);

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change email
export const changeEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { current_password, new_email } = req.body;

    // Verify current password
    const user = await findUserByEmail(req.user.email);
    const isPasswordValid = await comparePassword(current_password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Check if new email is already in use
    const existingUser = await findUserByEmail(new_email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update email
    await updateUserEmail(userId, new_email);

    res.json({
      message: 'Email updated successfully',
      email: new_email
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { current_password, new_password } = req.body;

    // Verify current password
    const user = await findUserByEmail(req.user.email);
    const isPasswordValid = await comparePassword(current_password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    await updateUserPassword(userId, newPasswordHash);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// Deactivate account
export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.userId;

    await deactivateUser(userId);

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    // Verify password
    const user = await findUserByEmail(req.user.email);
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete profile photo
    if (user.photo_url) {
      await deleteFile(user.photo_url);
    }

    // Delete user (cascade will delete swipes, matches, messages)
    await deleteUser(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
