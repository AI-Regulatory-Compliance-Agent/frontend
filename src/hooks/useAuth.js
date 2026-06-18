/**
 * useAuth Hook — Convenience wrapper for AuthContext.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *
 *   // In a component:
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
