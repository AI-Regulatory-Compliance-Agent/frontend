/**
 * LoginPage — Email/password login with gradient background.
 *
 * Semantic structure:
 *   <main.auth>
 *     <button.auth__theme-toggle>
 *     <section.auth__card.card-glass>
 *       <header.auth__logo>
 *       <h1.auth__title>
 *       <p.auth__subtitle>
 *       <div.auth__error> (conditional)
 *       <form.auth__form>
 *       <footer.auth__footer>
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isLight = root.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  const getErrorIcon = (errorMsg) => {
    if (!errorMsg) return '';
    if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('account')) return '✉️';
    if (errorMsg.toLowerCase().includes('password')) return '🔒';
    return '⚠️';
  };

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

  if (isAuthenticated) return null;

  return (
    <main className="auth animate-fade-in">
      {/* Floating theme toggle */}
      <button
        className="auth__theme-toggle"
        onClick={toggleTheme}
        title="Toggle theme"
        type="button"
        aria-label="Toggle colour theme"
      >
        <span className="theme-icon-dark" aria-hidden>☀️</span>
        <span className="theme-icon-light" aria-hidden>🌙</span>
      </button>

      <section className="auth__card card-glass" aria-label="Sign in">
        {/* Logo */}
        <header className="auth__logo">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
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
        </header>

        <h1 className="auth__title">ComplianceAI</h1>
        <p className="auth__subtitle">AI-Powered Regulatory Gap Analysis</p>

        {/* Error display */}
        {error && (
          <div className="auth__error" role="alert">
            <span className="auth-error-icon" aria-hidden="true">{getErrorIcon(error)}</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn--lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? <><span className="spinner" aria-hidden /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <footer className="auth__footer">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </footer>
      </section>
    </main>
  );
}
