const axios = require('axios');
const Investor = require('../models/investor');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generateInvestorSuggestions(query) {
    try {
      // Get all investors/mentors from database
      const investors = await Investor.getAll();

      // Prepare prompt with context and query
      const prompt = this._preparePrompt(query, investors);

      // Make request to Gemini API
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }
      );

      // Extract and format the response
      const suggestions = this._formatResponse(response.data);
      return suggestions;

    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw new Error('Failed to generate suggestions');
    }
  }

  _preparePrompt(query, investors) {
    // Convert investors data to a string format for the prompt
    const investorsContext = investors.map(inv => {
      return `Name: ${inv.name}
Type: ${inv.type}
Expertise: ${Array.isArray(inv.expertise) ? inv.expertise.join(', ') : inv.expertise}
Location: ${inv.location}
${inv.investment_range ? `Investment Range: ${inv.investment_range}` : ''}
Description: ${inv.description}
---`;
    }).join('\n');

    // Create the prompt with context and user query
    return `Based on the following list of investors and mentors:

${investorsContext}

User Query: "${query}"

Please suggest up to 3 most relevant investors or mentors that match this query. Consider their expertise, location, and investment preferences if applicable. For each suggestion, explain why they would be a good match.

Format your response as a JSON array with objects containing:
{
  "name": "Investor/Mentor Name",
  "type": "investor/mentor",
  "reason": "Detailed explanation of why they're a good match",
  "match_score": "percentage match (0-100)"
}`;
  }

  _formatResponse(response) {
    try {
      // Extract the text content from Gemini's response
      const text = response.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      const suggestions = JSON.parse(text);

      // Validate and clean the response format
      return suggestions.map(suggestion => ({
        name: suggestion.name,
        type: suggestion.type,
        reason: suggestion.reason,
        match_score: parseInt(suggestion.match_score) || 0
      }));

    } catch (error) {
      console.error('Error formatting AI response:', error);
      throw new Error('Failed to format AI response');
    }
  }
}

module.exports = new AIService();