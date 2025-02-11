import { pool } from '../db/db.js';

// Helper function to execute queries
const query = (text, params) => pool.query(text, params);

// Create a new user
export async function create({ googleId, email, displayName, profilePicture }) {
  const queryText = `
    INSERT INTO users (google_id, email, display_name, profile_picture, credits)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [googleId, email, displayName, profilePicture, 5]; // Start with 5 credits
  try {
    const result = await query(queryText, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
}

// Find user by Google ID
export async function findByGoogleId(googleId) {
  const queryText = 'SELECT * FROM users WHERE google_id = $1';
  try {
    const result = await query(queryText, [googleId]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error finding user by Google ID: ${error.message}`);
  }
}

// Find user by email
export async function findByEmail(email) {
  const queryText = 'SELECT * FROM users WHERE email = $1';
  try {
    const result = await query(queryText, [email]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
}

// Update user's credits
export async function updateCredits(userId, credits) {
  const queryText = `
    UPDATE users 
    SET credits = $2
    WHERE id = $1
    RETURNING *
  `;
  try {
    const result = await query(queryText, [userId, credits]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating user credits: ${error.message}`);
  }
}

// Get user's current credit balance
export async function getCredits(userId) {
  const queryText = 'SELECT credits FROM users WHERE id = $1';
  try {
    const result = await query(queryText, [userId]);
    return result.rows[0]?.credits;
  } catch (error) {
    throw new Error(`Error getting user credits: ${error.message}`);
  }
}

// Update user's profile
export async function updateProfile(userId, updates) {
  const queryText = `
    UPDATE users 
    SET display_name = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  try {
    const result = await query(queryText, [userId, updates.display_name]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating user profile: ${error.message}`);
  }
}

// Create the users table if it doesn't exist
export async function createTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      profile_picture TEXT,
      credits INTEGER NOT NULL DEFAULT 5,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await query(queryText);
    console.log('Users table created or already exists');
  } catch (error) {
    throw new Error(`Error creating users table: ${error.message}`);
  }
}

// Create the users table when the application starts
createTable().catch(console.error);