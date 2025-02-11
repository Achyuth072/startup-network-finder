import express from 'express';
import { findByGoogleId, updateProfile } from '../models/user.js';

const router = express.Router();

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await findByGoogleId(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send sensitive information
    const { google_id, created_at, updated_at, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's credit history (can be expanded later)
router.get('/credits/history', isAuthenticated, async (req, res) => {
  try {
    const user = await findByGoogleId(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For MVP, just return current credits
    // This can be expanded later to include credit transaction history
    res.json({
      currentCredits: user.credits,
      // history: [] // To be implemented in future
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (limited fields)
router.patch('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await findByGoogleId(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For MVP, only allow updating display name
    if (req.body.displayName) {
      await updateProfile(user.id, { display_name: req.body.displayName });
      res.json({ message: 'Profile updated successfully' });
    } else {
      res.status(400).json({ error: 'No valid fields to update' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as default };