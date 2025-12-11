import express from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

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

// Middleware untuk verifikasi JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
    console.log(error)
  }
};

// Middleware untuk cek role
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Akses ditolak' });
  }
  next();
};

// Get absensi data dengan filter
router.get('/absensi', authenticate, async (req, res) => {
  try {
    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const { kelas, startDate, endDate } = req.query;

    // Get all attendance data
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range: 'Absensi!A2:E',
    });

    let data = response.data.values || [];
    
    // Filter berdasarkan role
    if (req.user.role === 'siswa' || req.user.role === 'sekertaris') {
      data = data.filter(row => row[2] === req.user.kelas);
    } else if (req.user.role === 'guru_wali_murid') {
      // Asumsi guru wali hanya melihat kelas tertentu
      data = data.filter(row => row[2] === req.user.kelas);
    }

    // Filter tambahan berdasarkan query params
    if (kelas) {
      data = data.filter(row => row[2] === kelas);
    }
    
    if (startDate) {
      data = data.filter(row => new Date(row[0]) >= new Date(startDate));
    }
    
    if (endDate) {
      data = data.filter(row => new Date(row[0]) <= new Date(endDate));
    }

    // Format response
    const formatted = data.map(row => ({
      tanggal: row[0],
      nama: row[1],
      kelas: row[2],
      status: row[3],
      keterangan: row[4] || '',
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('Get absensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new attendance record
router.post('/absensi', authenticate, checkRole(['guru', 'sekertaris']), async (req, res) => {
  try {
    const { tanggal, nama, kelas, status, keterangan } = req.body;
    
    if (!tanggal || !nama || !kelas || !status) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Add new row to spreadsheet
    await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId,
      range: 'Absensi!A:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[tanggal, nama, kelas, status, keterangan || '']],
      },
    });

    res.json({ success: true, message: 'Data absensi berhasil ditambahkan' });
  } catch (error) {
    console.error('Add absensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (only for guru)
router.get('/users', authenticate, checkRole(['guru']), async (req, res) => {
  try {
    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range: 'Users!A2:D',
    });

    const users = (response.data.values || []).map(row => ({
      username: row[0],
      role: row[2],
      kelas: row[3] || '',
    }));

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new user (only for guru)
router.post('/users', authenticate, checkRole(['guru']), async (req, res) => {
  try {
    const { username, password, role, kelas } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId,
      range: 'Users!A:D',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[username, password, role, kelas || '']],
      },
    });

    res.json({ success: true, message: 'User berhasil ditambahkan' });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update attendance record
router.put('/absensi/:index', authenticate, checkRole(['guru', 'sekertaris']), async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { tanggal, nama, kelas, status, keterangan } = req.body;
    
    if (isNaN(index) || index < 2) {
      return res.status(400).json({ error: 'Index tidak valid' });
    }

    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId,
      range: `Absensi!A${index}:E${index}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[tanggal, nama, kelas, status, keterangan || '']],
      },
    });

    res.json({ success: true, message: 'Data berhasil diupdate' });
  } catch (error) {
    console.error('Update absensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete attendance record
router.delete('/absensi/:index', authenticate, checkRole(['guru']), async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    if (isNaN(index) || index < 2) {
      return res.status(400).json({ error: 'Index tidak valid' });
    }

    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Untuk delete, kita bisa clear values atau geser data
    await sheets.spreadsheets.values.clear({
      auth: authClient,
      spreadsheetId,
      range: `Absensi!A${index}:E${index}`,
    });

    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    console.error('Delete absensi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get kelas list for filter
router.get('/kelas', authenticate, async (req, res) => {
  try {
    const authClient = await auth.getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range: 'Absensi!C2:C',
    });

    const kelasList = [...new Set(response.data.values?.flat() || [])]
      .filter(kelas => kelas && kelas.trim())
      .sort();

    res.json({ kelas: kelasList });
  } catch (error) {
    console.error('Get kelas error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;