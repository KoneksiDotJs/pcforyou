import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Wajib agar cookie (JWT) selalu terkirim ke backend
  headers: {
    'Content-Type': 'application/json',
  },
});