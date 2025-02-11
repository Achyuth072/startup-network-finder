import { pool } from '../db/db.js';

// Helper function to execute queries
const query = (text, params) => pool.query(text, params);

// Create a new investor/mentor
export async function create({ name, type, expertise, location, investmentRange, portfolio, description }) {
  const queryText = `
    INSERT INTO investors_mentors (
      name, 
      type, 
      expertise, 
      location, 
      investment_range, 
      portfolio, 
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [name, type, expertise, location, investmentRange, portfolio, description];
  try {
    const result = await query(queryText, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating investor/mentor: ${error.message}`);
  }
}

// Get all investors/mentors
export async function getAll() {
  const queryText = 'SELECT * FROM investors_mentors';
  try {
    const result = await query(queryText);
    return result.rows;
  } catch (error) {
    throw new Error(`Error getting investors/mentors: ${error.message}`);
  }
}

// Search investors/mentors by criteria (for local search fallback)
export async function search({ type, expertise, location }) {
  const queryText = `
    SELECT * FROM investors_mentors
    WHERE ($1::text IS NULL OR type = $1)
    AND ($2::text IS NULL OR expertise ILIKE $2)
    AND ($3::text IS NULL OR location ILIKE $3)
  `;
  const values = [type, expertise ? `%${expertise}%` : null, location ? `%${location}%` : null];
  try {
    const result = await query(queryText, values);
    return result.rows;
  } catch (error) {
    throw new Error(`Error searching investors/mentors: ${error.message}`);
  }
}

// Create the investors_mentors table if it doesn't exist
export async function createTable() {
  const queryText = `
    CREATE TABLE IF NOT EXISTS investors_mentors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('investor', 'mentor')),
      expertise TEXT[] NOT NULL,
      location TEXT,
      investment_range TEXT,
      portfolio JSONB,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await query(queryText);
    console.log('Investors/Mentors table created or already exists');

    // Create indexes for better search performance
    await query('CREATE INDEX IF NOT EXISTS idx_investors_type ON investors_mentors(type)');
    await query('CREATE INDEX IF NOT EXISTS idx_investors_expertise ON investors_mentors USING GIN(expertise)');
    await query('CREATE INDEX IF NOT EXISTS idx_investors_location ON investors_mentors(location)');
  } catch (error) {
    throw new Error(`Error creating investors_mentors table: ${error.message}`);
  }
}

// Add some sample data for testing
export async function addSampleData() {
  if (process.env.NODE_ENV === 'development') {
    const sampleData = [
      {
        name: 'John Smith',
        type: 'investor',
        expertise: ['fintech', 'blockchain', 'ai'],
        location: 'San Francisco',
        investment_range: '$500K - $2M',
        portfolio: JSON.stringify({
          companies: ['TechCo', 'BlockchainX', 'AIVentures'],
          successful_exits: 3
        }),
        description: 'Early stage investor focused on emerging technologies'
      },
      {
        name: 'Sarah Johnson',
        type: 'mentor',
        expertise: ['startup growth', 'marketing', 'product strategy'],
        location: 'New York',
        investment_range: null,
        portfolio: JSON.stringify({
          expertise_areas: ['GTM Strategy', 'Product-Market Fit', 'Team Building'],
          years_experience: 15
        }),
        description: 'Experienced startup advisor and former founder'
      }
    ];

    for (const data of sampleData) {
      try {
        await create(data);
      } catch (error) {
        console.error(`Error adding sample data: ${error.message}`);
      }
    }
  }
}

// Create the table and add sample data when the application starts
createTable()
  .then(() => addSampleData())
  .catch(console.error);