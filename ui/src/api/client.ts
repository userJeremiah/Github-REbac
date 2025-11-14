import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add user email
apiClient.interceptors.request.use(
  (config) => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      config.headers['X-User-Email'] = userEmail;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }

    return Promise.reject({ message, status, error });
  }
);
