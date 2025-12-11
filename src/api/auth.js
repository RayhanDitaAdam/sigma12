/* eslint-env node */
import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const router = express.Router();
const { sheets } = google.sheets('v4');

const auth = new google.auth.GoogleAuth({
  credentials: {
    // eslint-disable-next-line no-undef
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // eslint-disable-next-line no-undef
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password diperlukan' });
    }

    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Get users from spreadsheet
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range: 'Users!A2:D',
    });

    const users = response.data.values || [];
    
    // Find user
    const user = users.find(u => 
      u[0] === username && u[1] === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Create JWT token
    const userData = {
      username: user[0],
      role: user[2],
      kelas: user[3] || null,
    };

    const token = jwt.sign(
      userData,
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
      // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Token tidak valid' });
    console.log(error)
  }
});

export default router;