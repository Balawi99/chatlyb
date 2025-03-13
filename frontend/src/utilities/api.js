import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent and received
});

// Add a request interceptor to include the token in all requests
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

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear local storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

// Conversations API calls
export const conversationsAPI = {
  getAll: () => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  addMessage: (id, content) => api.post(`/conversations/${id}/messages`, { content }),
  updateMessageStatus: (id, status) => api.patch(`/conversations/messages/${id}/status`, { status }),
};

// Knowledge Base API calls
export const knowledgeBaseAPI = {
  getAll: () => api.get('/knowledge-base'),
  create: (data) => api.post('/knowledge-base', data),
  update: (id, data) => api.put(`/knowledge-base/${id}`, data),
  delete: (id) => api.delete(`/knowledge-base/${id}`),
  crawlWebsite: (data) => api.post('/knowledge-base/crawl', data),
};

// Widget API calls
export const widgetAPI = {
  getConfig: () => api.get('/widget'),
  updateConfig: (config) => api.put('/widget', config),
  getEmbedCode: () => api.get('/widget/embed'),
};

// Settings API calls
export const settingsAPI = {
  getProfile: () => api.get('/settings'),
  updateProfile: (data) => api.put('/settings', data),
};

export default api; 