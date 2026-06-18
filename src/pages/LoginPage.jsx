/**
 * LoginPage — Email/password login with gradient background.
 *
 * Features:
 *   - Glassmorphism card design
 *   - Email/password validation
 *   - Error message display
 *   - Link to register page
 *   - Auto-redirect to dashboard if already logged in
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-glass">
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto' }}>
            <rect width="64" height="64" rx="16" fill="url(#auth-logo-grad)" />
            <path d="M32 16L44 24V40L32 48L20 40V24L32 16Z" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M28 32L31 35L37 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="auth-logo-grad" x1="0" y1="0" x2="64" y2="64">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="auth-title">ComplianceAI</h1>
        <p className="auth-subtitle">AI-Powered Regulatory Gap Analysis</p>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--risk-critical)',
            fontSize: '0.85rem',
            marginBottom: 'var(--space-md)',
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
