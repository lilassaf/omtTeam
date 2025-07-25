import axios from 'axios';
import store from '../app/store'; // Adjust path to your Redux store
import { selectClientAuthToken } from '../features/client/auth'; // Example selector path

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Create Axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', // Default for most requests
  },
});

// Request interceptor: injects auth token into headers
apiClient.interceptors.request.use(
  (config) => {
    const token = selectClientAuthToken(store.getState());
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handles global API errors (e.g., 401, 403)
apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...');
      // Example: Trigger logout or redirect
      // store.dispatch(logoutAction());
    }
    return Promise.reject(error); // Propagate error for local handling
  }
);

export default apiClient;