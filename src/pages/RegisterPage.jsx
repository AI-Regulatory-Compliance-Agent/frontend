/**
 * RegisterPage — Account creation with the same glassmorphism design.
 *
 * Fixed: Race condition with isAuthenticated redirect moved to useEffect.
 * Added: Theme toggle button on auth page.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated — useEffect avoids render-phase navigation
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Theme toggle
  const toggleTheme = () => {
    const root = document.documentElement;
    const isLight = root.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if already authenticated (wait for redirect)
  if (isAuthenticated) return null;

  return (
    <div className="auth-page">
      {/* Floating Theme Toggle */}
      <button
        className="auth-theme-toggle"
        onClick={toggleTheme}
        title="Toggle theme"
        type="button"
      >
        <span className="theme-icon-dark">☀️</span>
        <span className="theme-icon-light">🌙</span>
      </button>

      <div className="auth-card card-glass">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto' }}>
            <rect width="64" height="64" rx="16" fill="url(#reg-logo-grad)" />
            <path d="M32 16L44 24V40L32 48L20 40V24L32 16Z" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M28 32L31 35L37 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="reg-logo-grad" x1="0" y1="0" x2="64" y2="64">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="auth-title">ComplianceAI</h1>
        <p className="auth-subtitle">Create your account</p>

        {error && (
          <div className="auth-error-banner">
            <span className="auth-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
          >
            {loading ? (
              <><span className="spinner" /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
