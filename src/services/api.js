import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : window.location.origin,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {  
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (username, password) => 
    api.post('/api/auth/login', { username, password }),
  
  verify: () => 
    api.post('/api/auth/verify'),
};

export const attendanceAPI = {
  getAll: (params) => 
    api.get('/api/sheets/absensi', { params }),
  
  create: (data) => 
    api.post('/api/sheets/absensi', data),
  
  update: (index, data) => 
    api.put(`/api/sheets/absensi/${index}`, data),
  
  delete: (index) => 
    api.delete(`/api/sheets/absensi/${index}`),
  
  getKelasList: () => 
    api.get('/api/sheets/kelas'),
};

export const userAPI = {
  getAll: () => 
    api.get('/api/sheets/users'),
  
  create: (data) => 
    api.post('/api/sheets/users', data),
};

export default api;