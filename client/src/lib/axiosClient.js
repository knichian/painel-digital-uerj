import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3001',
  // timeout: 10000, // ajuste se quiser
});

// Attach token automatically on requests
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response handler: if 401, remove token and redirect to /login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
          try {
            localStorage.removeItem('token');
          } catch {
            // ignore
          }
      // Use full reload to ensure app state resets and router navigates to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
