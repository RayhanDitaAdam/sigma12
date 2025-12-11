

// Rate limiting middleware (simple version)
const rateLimiter = new Map();

export const rateLimit = (windowMs = 60000, maxRequests = 100) => (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 1, startTime: now });
    setTimeout(() => rateLimiter.delete(ip), windowMs);
    return next();
  }
  
  const requestData = rateLimiter.get(ip);
  
  if (now - requestData.startTime > windowMs) {
    rateLimiter.set(ip, { count: 1, startTime: now });
    return next();
  }
  
  if (requestData.count >= maxRequests) {
    return res.status(429).json({ 
      error: 'Terlalu banyak permintaan. Coba lagi nanti.' 
    });
  }
  
  requestData.count++;
  next();
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`${method} ${url} ${statusCode} ${duration}ms`);
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res) => {
  console.error('Error:', err);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token telah kadaluarsa' });
  }
  
  res.status(500).json({ 
    error: 'Terjadi kesalahan internal server',
    // eslint-disable-next-line no-undef
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://absensi-bk.vercel.app',
      // Tambahkan domain production Anda di sini
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Validation middleware
export const validateAttendance = (req, res, next) => {
  const { tanggal, nama, kelas, status } = req.body;
  
  if (!tanggal || !nama || !kelas || !status) {
    return res.status(400).json({ 
      error: 'Data tidak lengkap',
      required: ['tanggal', 'nama', 'kelas', 'status']
    });
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(tanggal)) {
    return res.status(400).json({ 
      error: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD' 
    });
  }
  
  // Validate status
  const validStatuses = ['Hadir', 'Sakit', 'Izin', 'Alpha'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Status tidak valid',
      validStatuses 
    });
  }
  
  next();
};

export const validateUser = (req, res, next) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ 
      error: 'Data tidak lengkap',
      required: ['username', 'password', 'role']
    });
  }
  
  // Validate username
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ 
      error: 'Username harus antara 3-50 karakter' 
    });
  }
  
  // Validate password
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password minimal 6 karakter' 
    });
  }
  
  // Validate role
  const validRoles = ['guru', 'siswa', 'sekertaris', 'guru_wali_murid'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      error: 'Role tidak valid',
      validRoles 
    });
  }
  
  next();
};