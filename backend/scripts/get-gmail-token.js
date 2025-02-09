import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import open from 'open';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3001/oauth2callback'
);

// Generate URL for consent screen
const scopes = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];

const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

// Create temporary server to handle the OAuth2 callback
const server = http.createServer(async (req, res) => {
  try {
    const { query } = url.parse(req.url, true);
    
    if (query.code) {
      const { tokens } = await oauth2Client.getToken(query.code);
      
      console.log('\n=== Gmail Refresh Token ===');
      console.log(tokens.refresh_token);
      console.log('\nAdd this refresh token to your .env file as GMAIL_REFRESH_TOKEN\n');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>Authorization Successful</h1>
        <p>You can now close this window and check your terminal for the refresh token.</p>
      `);
      
      setTimeout(() => process.exit(0), 1000);
    } else {
      res.writeHead(400);
      res.end('Authorization failed');
    }
  } catch (error) {
    console.error('Error getting refresh token:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// Start server and open browser
server.listen(3001, async () => {
  console.log('\nOpening browser for Gmail authorization...');
  console.log('Please login and grant the requested permissions.\n');
  
  try {
    await open(authorizeUrl);
  } catch (error) {
    console.log('Could not open browser automatically.');
    console.log('Please open this URL manually:', authorizeUrl);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});