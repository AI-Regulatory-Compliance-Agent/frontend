/**
 * Sidebar — History + navigation + theme toggle.
 * Minimal SVG logo replaces emoji. Dark/light theme toggle at bottom.
 */

import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ history, activeId, onSelect, onNewAnalysis, onUpdateAnalysis }) {
  const { logout } = useAuth();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Theme toggle
  const toggleTheme = () => {
    const root = document.documentElement;
    const isLight = root.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  return (
    <div className="sidebar">
      {/* ── Header with SVG Logo ───────────────────── */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="url(#sidebar-logo-grad)" />
            <path d="M32 16L44 24V40L32 48L20 40V24L32 16Z" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M28 32L31 35L37 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="sidebar-logo-grad" x1="0" y1="0" x2="64" y2="64">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div className="sidebar-logo">ComplianceAI</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '-2px' }}>
              Regulatory Gap Analysis
            </div>
          </div>
        </div>
      </div>

      {/* ── New Analysis Button ────────────────────── */}
      <div style={{ padding: 'var(--space-md)' }}>
        <button className="btn btn-primary" onClick={onNewAnalysis}
          style={{ width: '100%' }}>
          ＋ New Analysis
        </button>
      </div>

      {/* ── History List ───────────────────────────── */}
      <div className="sidebar-content">
        <div className="sidebar-section-title">Analysis History</div>

        {history.length === 0 ? (
          <div style={{
            padding: 'var(--space-lg)',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '0.8rem',
          }}>
            No analyses yet.
            <br />Start your first one above.
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id}
              className={`sidebar-item ${activeId === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}>
              <div className="sidebar-item-name">{item.company_name}</div>
              <div className="sidebar-item-meta">
                {item.status === 'complete' ? (
                  <>
                    <span className={`badge badge-${item.overall_risk_level?.toLowerCase() || 'pending'}`}>
                      {item.overall_risk_score ?? '—'} {item.overall_risk_level || ''}
                    </span>
                    {item.confidence_level && item.confidence_level !== 'full' && (
                      <span className={`badge badge-${item.confidence_level === 'partial' ? 'probable' : 'unknown'}`}>
                        {item.confidence_level}
                      </span>
                    )}
                  </>
                ) : (
                  <span className={`badge badge-${item.status}`}>
                    {item.status}
                  </span>
                )}
                <span>{formatDate(item.created_at)}</span>
              </div>
              {item.status === 'complete' && (
                <button className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); onUpdateAnalysis(item.id); }}
                  style={{ marginTop: 'var(--space-xs)', alignSelf: 'flex-start' }}>
                  ↻ Update
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Footer: Theme Toggle + Logout ──────────── */}
      <div className="sidebar-footer" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button className="btn btn-secondary btn-sm" onClick={toggleTheme}
          style={{ flex: '0 0 auto', padding: '6px 10px' }}
          title="Toggle theme">
          <span className="theme-icon-dark">☀️</span>
          <span className="theme-icon-light">🌙</span>
        </button>
        <button className="btn btn-secondary btn-sm" onClick={logout}
          style={{ flex: 1 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
