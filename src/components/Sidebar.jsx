/**
 * Sidebar — App navigation, history list, theme toggle, logout.
 *
 * Semantic structure:
 *   <aside.sidebar#sidebar>
 *     <header.sidebar__header>
 *     <div.sidebar__new-btn-wrapper>
 *     <nav.sidebar__nav>
 *       <h2.sidebar__section-label>
 *       <div.sidebar__empty> OR list of sidebar__nav-item
 *     </nav>
 *     <footer.sidebar__footer>
 *
 * Mobile: sidebar receives isOpen prop.
 * CSS adds transform: translateX(-100%) when not open.
 */

import { useAuth } from '../hooks/useAuth';

export default function Sidebar({
  id,
  isOpen,
  history,
  activeId,
  onSelect,
  onNewAnalysis,
  onUpdateAnalysis,
}) {
  const { logout } = useAuth();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  return (
    <aside
      id={id}
      className={`sidebar${isOpen ? ' is-open' : ''}`}
      aria-label="Application navigation"
    >
      {/* ── Brand header ────────────────────────── */}
      <header className="sidebar__header">
        <div className="sidebar__logo-mark" aria-hidden="true">
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
        </div>
        <div>
          <div className="sidebar__logo-text">ComplianceAI</div>
          <div className="sidebar__tagline">Regulatory Gap Analysis</div>
        </div>
      </header>

      {/* ── New Analysis CTA ─────────────────────── */}
      <div className="sidebar__new-btn-wrapper">
        <button
          className="btn btn-primary"
          onClick={onNewAnalysis}
          style={{ width: '100%' }}
          aria-label="Start a new analysis"
        >
          ＋ New Analysis
        </button>
      </div>

      {/* ── History list ─────────────────────────── */}
      <nav className="sidebar__nav" aria-label="Analysis history">
        <h2 className="sidebar__section-label">Analysis History</h2>

        {history.length === 0 ? (
          <p className="sidebar__empty">
            No analyses yet.<br />Start your first one above.
          </p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className={`sidebar__nav-item${activeId === item.id ? ' sidebar__nav-item--active' : ''}`}
              onClick={() => onSelect(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(item.id)}
              aria-current={activeId === item.id ? 'page' : undefined}
              aria-label={`View analysis: ${item.company_name}`}
            >
              <div className="sidebar__item-name">{item.company_name}</div>
              <div className="sidebar__item-meta">
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
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                )}
                <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
              </div>
              {item.status === 'complete' && (
                <button
                  className="btn btn-secondary btn--sm"
                  onClick={(e) => { e.stopPropagation(); onUpdateAnalysis(item.id); }}
                  aria-label={`Re-run analysis for ${item.company_name}`}
                  style={{ marginTop: 'var(--space-1)', alignSelf: 'flex-start' }}
                >
                  ↻ Update
                </button>
              )}
            </div>
          ))
        )}
      </nav>

      {/* ── Footer: theme + logout ───────────────── */}
      <footer className="sidebar__footer">
        <button
          className="btn btn-secondary btn--sm"
          onClick={toggleTheme}
          title="Toggle colour theme"
          aria-label="Toggle colour theme"
          style={{ flexShrink: 0 }}
        >
          <span className="theme-icon-dark" aria-hidden>☀️</span>
          <span className="theme-icon-light" aria-hidden>🌙</span>
        </button>
        <button
          className="btn btn-secondary btn--sm"
          onClick={logout}
          style={{ flex: 1 }}
        >
          Sign Out
        </button>
      </footer>
    </aside>
  );
}
