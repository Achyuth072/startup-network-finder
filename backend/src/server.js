import app from './app.js';
import dotenv from 'dotenv';
import { startCreditMonitoring } from './services/creditService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Verify required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GMAIL_REFRESH_TOKEN',
  'GMAIL_EMAIL',
  'DATABASE_URL',
  'SESSION_SECRET',
  'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start credit monitoring service
  try {
    startCreditMonitoring();
    console.log('Credit monitoring service started');
  } catch (error) {
    console.error('Failed to start credit monitoring service:', error);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});