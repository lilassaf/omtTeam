import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'authorization': `${localStorage.getItem('access_token')}`,
});

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: getHeaders(),
});

