import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add a request interceptor to include the latest token for each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['authorization'] = `${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
}, (error) => {
  return Promise.reject(error);
});

