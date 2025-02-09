const db = require('../db/db');

class User {
  // Create a new user
  static async create({ googleId, email, displayName, profilePicture }) {
    const query = `
      INSERT INTO users (google_id, email, display_name, profile_picture, credits)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [googleId, email, displayName, profilePicture, 5]; // Start with 5 credits
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by Google ID
  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    try {
      const result = await db.query(query, [googleId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by Google ID: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Update user's credits
  static async updateCredits(userId, credits) {
    const query = `
      UPDATE users 
      SET credits = $2
      WHERE id = $1
      RETURNING *
    `;
    try {
      const result = await db.query(query, [userId, credits]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user credits: ${error.message}`);
    }
  }

  // Get user's current credit balance
  static async getCredits(userId) {
    const query = 'SELECT credits FROM users WHERE id = $1';
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0]?.credits;
    } catch (error) {
      throw new Error(`Error getting user credits: ${error.message}`);
    }
  }

  // Create the users table if it doesn't exist
  static async createTable() {
    const query = `
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
      await db.query(query);
      console.log('Users table created or already exists');
    } catch (error) {
      throw new Error(`Error creating users table: ${error.message}`);
    }
  }
}

// Create the users table when the application starts
User.createTable().catch(console.error);

module.exports = User;