import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { findByGoogleId, create } from './models/user.js';
import { startCreditMonitoring } from './services/creditService.js';

// Get dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();

// Logging middleware
app.use(morgan('dev'));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Initialize passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      console.log('Google Profile:', JSON.stringify(profile, null, 2)); // Debug log
      
      let user = await findByGoogleId(profile.id);
      
      if (!user) {
        // Create new user if they don't exist
        user = await create({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicture: profile.photos?.[0]?.value || ''
        });
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Passport Strategy Error:', error); // Debug log
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user); // Debug log
  done(null, user.google_id); // Use google_id instead of id
});

passport.deserializeUser(async (googleId, done) => {
  try {
    console.log('Deserializing google_id:', googleId); // Debug log
    const user = await findByGoogleId(googleId);
    if (!user) {
      console.log('User not found during deserialization'); // Debug log
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    console.error('Deserialization Error:', error); // Debug log
    done(error, null);
  }
});

// Import routes
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import userRoutes from './routes/user.js';

// Create the API router
const apiRouter = express.Router();

// Mount routes under /api
apiRouter.use('/auth', authRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/user', userRoutes);

// Mount the API router
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start email & credit monitoring service
startCreditMonitoring();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err); // Debug log
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

export { app };
