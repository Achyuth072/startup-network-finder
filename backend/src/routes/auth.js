import express from 'express';
import passport from 'passport';
import { findByGoogleId, create } from '../models/user.js';

const router = express.Router();

// Helper to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Google OAuth login route
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: true
  }),
  async (req, res) => {
    try {
      console.log('Callback user:', req.user); // Debug log
      
      // The user should already be created/found by the passport strategy
      if (!req.user) {
        console.error('No user in request after authentication');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      res.redirect(`${process.env.FRONTEND_URL}/search`);
    } catch (error) {
      console.error('Error in auth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// Get current user info
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching user info for:', req.user); // Debug log
    
    const user = await findByGoogleId(req.user.google_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive information
    const { google_id, created_at, updated_at, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  console.log('Logging out user:', req.user); // Debug log
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Error during logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export { router as default };