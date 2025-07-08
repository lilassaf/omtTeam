import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

