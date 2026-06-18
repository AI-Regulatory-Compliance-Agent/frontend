/**
 * AuthContext — Global authentication state for the app.
 *
 * Provides:
 *   - user: { token, userId } or null
 *   - login(email, password): authenticates and stores JWT
 *   - register(email, password): creates account and stores JWT
 *   - logout(): clears JWT and redirects to login
 *   - isAuthenticated: boolean
 *
 * JWT Storage:
 *   Token is stored in localStorage so it persists across browser tabs
 *   and page refreshes. The token is automatically attached to all API
 *   requests via the Axios interceptor in api/client.js.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

// ── Create Context ──────────────────────────────────────────
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ── State ─────────────────────────────────────────────────
  // User object: { token } or null if not authenticated
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Initialize from localStorage ─────────────────────────
  // On app load, check if there's a saved token.
  // This allows the user to stay logged in across page refreshes.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;

    // Store token in localStorage for persistence
    localStorage.setItem('token', access_token);
    setUser({ token: access_token });

    return response.data;
  }, []);

  // ── Register ──────────────────────────────────────────────
  const register = useCallback(async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    const { access_token } = response.data;

    // Auto-login after registration
    localStorage.setItem('token', access_token);
    setUser({ token: access_token });

    return response.data;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // ── Context Value ─────────────────────────────────────────
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
