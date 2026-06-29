/**
 * RegisterPage — Account creation with glassmorphism design.
 *
 * Semantic structure matches LoginPage exactly:
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle('light-theme');
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

  if (isAuthenticated) return null;

  return (
    <main className="auth animate-fade-in">
      {/* Floating theme toggle */}
      <button
        className="auth__theme-toggle"
        onClick={toggleTheme}
        title="Toggle colour theme"
        type="button"
        aria-label="Toggle colour theme"
      >
        <span className="theme-icon-dark" aria-hidden>☀️</span>
        <span className="theme-icon-light" aria-hidden>🌙</span>
      </button>

      <section className="auth__card card-glass" aria-label="Create account">
        {/* Logo */}
        <header className="auth__logo">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
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
        </header>

        <h1 className="auth__title">ComplianceAI</h1>
        <p className="auth__subtitle">Create your account</p>

        {/* Error display */}
        {error && (
          <div className="auth__error" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Register form */}
        <form className="auth__form" onSubmit={handleSubmit} noValidate>
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
              autoComplete="email"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn--lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? <><span className="spinner" aria-hidden /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <footer className="auth__footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </footer>
      </section>
    </main>
  );
}
