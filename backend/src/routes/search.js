const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const creditService = require('../services/creditService');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Search endpoint
router.post('/', isAuthenticated, async (req, res) => {
  const { query } = req.body;
  const userId = req.user.id;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid query. Please provide a non-empty search query.'
    });
  }

  try {
    // Check if user has enough credits
    const hasCredits = await creditService.hasEnoughCredits(userId);
    if (!hasCredits) {
      return res.status(403).json({
        error: 'Insufficient credits',
        message: 'Please recharge your credits to continue searching'
      });
    }

    // Generate suggestions using AI
    const suggestions = await aiService.generateInvestorSuggestions(query);

    // Deduct credits only if AI generation was successful
    const remainingCredits = await creditService.deductCredits(userId);

    // Return the search results along with remaining credits
    res.json({
      suggestions,
      credits: remainingCredits
    });

  } catch (error) {
    console.error('Error in search endpoint:', error);

    if (error.message === 'Insufficient credits') {
      return res.status(403).json({
        error: 'Insufficient credits',
        message: 'Please recharge your credits to continue searching'
      });
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your search'
    });
  }
});

// Get remaining credits endpoint
router.get('/credits', isAuthenticated, async (req, res) => {
  try {
    const credits = await creditService.getBalance(req.user.id);
    res.json({ credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch credit balance'
    });
  }
});

module.exports = router;