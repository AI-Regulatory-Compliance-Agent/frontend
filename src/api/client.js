/**
 * API Client — Axios instance with JWT authentication.
 *
 * All API calls go through this client, which:
 *   1. Sets the base URL to the FastAPI backend (port 8000)
 *   2. Automatically attaches the JWT token from localStorage
 *   3. Redirects to /login on 401 responses (token expired)
 *
 * Usage in hooks:
 *   import api from '../api/client';
 *   const response = await api.post('/analyze', data);
 */

import axios from 'axios';

// ── Base URL ────────────────────────────────────────────────
// Points to the FastAPI backend. In Docker, this is the backend
// service on port 8000. In development, it's localhost:8000.
const API_BASE_URL = 'http://20.244.40.144:8000';

// ── Create Axios Instance ───────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ─────────────────────────────────────
// Attaches the JWT token to every outgoing request.
// The token is stored in localStorage after login/register.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // FastAPI expects: Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────
// Handles 401 responses globally — clears token and redirects to login.
// This covers cases where the JWT expires mid-session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear and redirect
      localStorage.removeItem('token');
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
