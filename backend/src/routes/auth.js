const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

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
      let user = await User.findByGoogleId(req.user.id);
      
      if (!user) {
        // Create new user if they don't exist
        user = await User.create({
          googleId: req.user.id,
          email: req.user.emails[0].value,
          displayName: req.user.displayName,
          profilePicture: req.user.photos[0]?.value
        });
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
    const user = await User.findByGoogleId(req.user.id);
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
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error during logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;