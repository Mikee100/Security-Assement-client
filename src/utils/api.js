import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Quiz API calls
export const quizAPI = {
  getQuestions: (category, limit) => api.get('/quiz/questions', { params: { category, limit } }),
  submitQuiz: (attemptData) => api.post('/quiz/submit', attemptData),
  getCategories: () => api.get('/quiz/categories'),
  getUserAttempts: () => api.get('/quiz/attempts'),
  getUserStats: () => api.get('/quiz/stats'),
  getLeaderboard: (limit) => api.get('/quiz/leaderboard', { params: { limit } }),
};

// Admin API calls
export const adminAPI = {
  getSystemStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllQuestions: () => api.get('/admin/questions'),
  createQuestion: (questionData) => api.post('/admin/questions', questionData),
  updateQuestion: (questionId, questionData) => api.put(`/admin/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/admin/questions/${questionId}`),
  getQuestionCategories: () => api.get('/admin/questions/categories'),
  getAttemptsByUser: (userId) => api.get(`/admin/users/${userId}/attempts`),
  getDetailedStats: () => api.get('/admin/stats/detailed'),
};

// Cybersecurity News API (public endpoint or placeholder)
export const getCyberNews = async () => {
  // Example: Using a free endpoint from a public news API (replace with your API key if needed)
  // This is a placeholder using a sample endpoint for demonstration
  // Replace 'YOUR_REAL_NEWSAPI_KEY' with your actual NewsAPI key
  const url = 'https://newsapi.org/v2/everything?q=cybersecurity&apiKey=0e5b4a008a08437ab6a5eca33f1b0e52';
  try {
    const response = await axios.get(url);
    return response.data.articles.slice(0, 5); // Return top 5 articles
  } catch (error) {
    console.error('Error fetching cybersecurity news:', error);
    return [];
  }
};

export default api; 