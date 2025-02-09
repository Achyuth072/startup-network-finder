import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const OAuth2 = google.auth.OAuth2;

// Gmail OAuth2 configuration
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Create nodemailer transporter
const createTransporter = async () => {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Send email notification for credit exhaustion
const sendCreditExhaustionEmail = async (userEmail) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: userEmail,
      subject: 'Credits Exhausted - Startup Network Finder',
      html: `
        <h2>Your search credits have been exhausted</h2>
        <p>To recharge your credits, please follow these steps:</p>
        <ol>
          <li>Send an email to ${process.env.GMAIL_EMAIL}</li>
          <li>Use the subject line: "recharge 5 credits"</li>
          <li>Include your registered email in the body of the email</li>
        </ol>
        <p>Your credits will be automatically recharged upon receipt of your email.</p>
      `
    });
  } catch (error) {
    console.error('Error sending credit exhaustion email:', error);
    throw error;
  }
};

// Monitor inbox for recharge requests
let lastCheckedTime = new Date();

const checkForRechargeEmails = async () => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Search for emails with the recharge subject line
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `subject:"recharge 5 credits" after:${Math.floor(lastCheckedTime.getTime() / 1000)}`
    });

    if (!response.data.messages) {
      return [];
    }

    const rechargeRequests = [];

    for (const message of response.data.messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });

      const headers = email.data.payload.headers;
      const from = headers.find(h => h.name === 'From').value;
      const subject = headers.find(h => h.name === 'Subject').value;
      
      if (subject.toLowerCase() === 'recharge 5 credits') {
        const userEmail = from.match(/<(.+)>/)?.[1] || from;
        rechargeRequests.push({
          messageId: message.id,
          userEmail
        });
      }
    }

    lastCheckedTime = new Date();
    return rechargeRequests;
  } catch (error) {
    console.error('Error checking for recharge emails:', error);
    throw error;
  }
};

// Send confirmation email after recharge
const sendRechargeConfirmationEmail = async (userEmail, credits) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: userEmail,
      subject: 'Credits Recharged - Startup Network Finder',
      html: `
        <h2>Your credits have been recharged!</h2>
        <p>Your account has been credited with ${credits} new search credits.</p>
        <p>You can now continue searching for investors and mentors.</p>
        <p>Thank you for using Startup Network Finder!</p>
      `
    });
  } catch (error) {
    console.error('Error sending recharge confirmation email:', error);
    throw error;
  }
};

export {
  sendCreditExhaustionEmail,
  checkForRechargeEmails,
  sendRechargeConfirmationEmail
};