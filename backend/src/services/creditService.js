import { pool } from '../db/db.js';
import { 
  sendCreditExhaustionEmail, 
  checkForRechargeEmails, 
  sendRechargeConfirmationEmail 
} from './emailService.js';

const DEFAULT_CREDITS = 5;
const RECHARGE_AMOUNT = 5;

const getUserCredits = async (userId) => {
  const result = await pool.query(
    'SELECT credits FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.credits || 0;
};

const hasEnoughCredits = async (userId) => {
  const credits = await getUserCredits(userId);
  return credits > 0;
};

const deductCredits = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current credits
    const result = await client.query(
      'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    
    const currentCredits = result.rows[0]?.credits || 0;
    
    if (currentCredits <= 0) {
      throw new Error('No credits available');
    }

    // Deduct one credit
    const newCredits = currentCredits - 1;
    await client.query(
      'UPDATE users SET credits = $1 WHERE id = $2',
      [newCredits, userId]
    );

    await client.query('COMMIT');

    // If credits are now zero, send notification
    if (newCredits === 0) {
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );
      const userEmail = userResult.rows[0]?.email;
      if (userEmail) {
        await sendCreditExhaustionEmail(userEmail);
      }
    }

    return newCredits;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getBalance = getUserCredits; // Alias for getUserCredits

const rechargeCredits = async (userEmail) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user exists and get current credits
    const result = await client.query(
      'SELECT id, credits FROM users WHERE email = $1 FOR UPDATE',
      [userEmail]
    );

    if (!result.rows[0]) {
      throw new Error('User not found');
    }

    const { id: userId, credits: currentCredits } = result.rows[0];

    // Add recharge amount
    const newCredits = currentCredits + RECHARGE_AMOUNT;
    await client.query(
      'UPDATE users SET credits = $1 WHERE id = $2',
      [newCredits, userId]
    );

    await client.query('COMMIT');

    // Send confirmation email
    await sendRechargeConfirmationEmail(userEmail, RECHARGE_AMOUNT);

    return newCredits;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Initialize credit monitoring
const startCreditMonitoring = () => {
  const CHECK_INTERVAL = 60000; // Check every minute

  setInterval(async () => {
    try {
      const rechargeRequests = await checkForRechargeEmails();
      
      for (const request of rechargeRequests) {
        try {
          await rechargeCredits(request.userEmail);
          console.log(`Credits recharged for user: ${request.userEmail}`);
        } catch (error) {
          console.error(`Failed to recharge credits for ${request.userEmail}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in credit monitoring:', error);
    }
  }, CHECK_INTERVAL);
};

export {
  getUserCredits,
  deductCredits,
  rechargeCredits,
  startCreditMonitoring,
  DEFAULT_CREDITS,
  hasEnoughCredits,
  getBalance
};