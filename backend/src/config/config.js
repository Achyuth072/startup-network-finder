import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../..', '.env') });

export const config = {
  server: {
    port: process.env.PORT || 5000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  session: {
    secret: process.env.SESSION_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  gmail: {
    email: process.env.GMAIL_EMAIL,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
  },
  credit: {
    initial: 5,
    rechargeAmount: 5,
  },
  email: {
    checkInterval: 60000, // 1 minute in milliseconds
    templates: {
      creditExhaustion: {
        subject: 'Credits Exhausted - Startup Network Finder',
        rechargeInstructions: 'recharge 5 credits',
      },
      rechargeConfirmation: {
        subject: 'Credits Recharged - Startup Network Finder',
      },
    },
  },
};

// Validate required configuration
export const validateConfig = () => {
  const requiredKeys = [
    'database.url',
    'session.secret',
    'google.clientId',
    'google.clientSecret',
    'gmail.email',
    'gmail.refreshToken',
    'ai.geminiApiKey',
  ];

  const missingKeys = requiredKeys.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });

  if (missingKeys.length > 0) {
    throw new Error(`Missing required configuration: ${missingKeys.join(', ')}`);
  }
};

// Validate in non-test environment
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

export default config;