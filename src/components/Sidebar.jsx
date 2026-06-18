/**
 * Sidebar — Past analysis history with navigation.
 *
 * Shows:
 *   - App logo
 *   - "New Analysis" button
 *   - Past analyses list (sorted newest first):
 *       CompanyName — score — risk level — date
 *   - "Update Analysis" action per item (re-analysis)
 *   - Logout button at bottom
 *
 * When user clicks an analysis, it loads the dashboard for that run.
 * When user clicks "Update Analysis", it navigates to the form
 * pre-populated with that analysis's company profile.
 */

import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ history, activeId, onSelect, onNewAnalysis, onUpdateAnalysis }) {
  const { logout } = useAuth();

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="sidebar">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🛡️ ComplianceAI</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
          Regulatory Gap Analysis
        </div>
      </div>

      {/* ── New Analysis Button ────────────────────────── */}
      <div style={{ padding: 'var(--space-md)' }}>
        <button className="btn btn-primary" onClick={onNewAnalysis}
          style={{ width: '100%' }}>
          ＋ New Analysis
        </button>
      </div>

      {/* ── History List ───────────────────────────────── */}
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
              {/* Company name */}
              <div className="sidebar-item-name">{item.company_name}</div>

              {/* Meta: score, risk, date */}
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

              {/* Update Analysis button */}
              {item.status === 'complete' && (
                <button className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); onUpdateAnalysis(item.id); }}
                  style={{ marginTop: 'var(--space-xs)', alignSelf: 'flex-start' }}>
                  ↻ Update Analysis
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Footer / Logout ────────────────────────────── */}
      <div className="sidebar-footer">
        <button className="btn btn-secondary btn-sm" onClick={logout}
          style={{ width: '100%' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
