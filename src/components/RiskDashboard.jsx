/**
 * RiskDashboard — Displays analysis results in a visual dashboard.
 *
 * Sections:
 *   1. Risk Score Gauge (single score or range bar)
 *   2. Summary Stats (total regs, gaps, critical/high counts)
 *   3. Applicable Regulations table
 *   4. Compliance Gaps table with severity color coding
 *   5. Remediation Plan table with priority labels
 *
 * Adapts display based on confidence_level:
 *   full    → single score gauge
 *   partial → score + range bar
 *   minimal → wide range + "low confidence" warning
 */

export default function RiskDashboard({ analysis }) {
  if (!analysis) return null;

  const {
    overall_risk_score = 0,
    overall_risk_level = 'LOW',
    risk_score_range,
    confidence_level = 'full',
    applicable_regulations = [],
    scored_gaps = [],
    remediation_plan = [],
  } = analysis;

  // CSS class for risk level coloring
  const riskClass = overall_risk_level?.toLowerCase() || 'low';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

      {/* ── Risk Score Section ──────────────────────────── */}
      <div className="card-glass" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div className={`risk-score-display ${riskClass}`}>
          {overall_risk_score}
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: 'var(--space-sm)' }}>
          <span className={`badge badge-${riskClass}`} style={{ fontSize: '0.85rem', padding: '5px 14px' }}>
            {overall_risk_level} RISK
          </span>
        </div>

        {/* Score range for partial/minimal */}
        {risk_score_range && confidence_level !== 'full' && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div className="risk-range-bar">
              <div className="risk-range-fill" style={{
                left: `${risk_score_range.min}%`,
                width: `${risk_score_range.max - risk_score_range.min}%`,
                background: `linear-gradient(90deg, var(--risk-low), var(--risk-${riskClass}))`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              <span>Min: {risk_score_range.min}</span>
              <span>Estimated: {risk_score_range.estimated}</span>
              <span>Max: {risk_score_range.max}</span>
            </div>
          </div>
        )}

        {/* Confidence badge */}
        <div style={{ marginTop: 'var(--space-md)' }}>
          <span className={`badge badge-${confidence_level === 'full' ? 'confirmed' : confidence_level === 'partial' ? 'probable' : 'unknown'}`}>
            {confidence_level?.toUpperCase()} CONFIDENCE
          </span>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
        {[
          { label: 'Regulations', value: applicable_regulations.length, color: 'var(--primary-400)' },
          { label: 'Total Gaps', value: scored_gaps.length, color: 'var(--text-primary)' },
          { label: 'Critical', value: scored_gaps.filter(g => g.risk_level === 'CRITICAL').length, color: 'var(--risk-critical)' },
          { label: 'High', value: scored_gaps.filter(g => g.risk_level === 'HIGH').length, color: 'var(--risk-high)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Applicable Regulations ──────────────────────── */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-md)' }}>📜 Applicable Regulations</h3>
        {applicable_regulations.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Regulation</th>
                <th>Relevance</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {applicable_regulations.map((reg, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{reg.name}</td>
                  <td>{reg.relevance}</td>
                  <td>
                    <span className={`badge badge-${reg.confidence?.toLowerCase() || 'unknown'}`}>
                      {reg.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-tertiary)' }}>No applicable regulations identified.</p>
        )}
      </div>

      {/* ── Compliance Gaps ─────────────────────────────── */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-md)' }}>🔍 Compliance Gaps</h3>
        {scored_gaps.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Regulation</th>
                <th>Gap</th>
                <th>Severity</th>
                <th>Risk</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {scored_gaps.map((gap, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '500' }}>{gap.regulation}</td>
                  <td>{gap.gap}</td>
                  <td style={{ fontWeight: '700', color: `var(--risk-${gap.risk_level?.toLowerCase() || 'medium'})` }}>
                    {gap.severity}
                  </td>
                  <td>
                    <span className={`badge badge-${gap.risk_level?.toLowerCase() || 'medium'}`}>
                      {gap.risk_level}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${gap.confidence?.toLowerCase() || 'unknown'}`}>
                      {gap.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-tertiary)' }}>No compliance gaps found. Looking good! ✅</p>
        )}
      </div>

      {/* ── Remediation Plan ────────────────────────────── */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-md)' }}>🔧 Remediation Plan</h3>
        {remediation_plan.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Gap</th>
                <th>Action</th>
                <th>Priority</th>
                <th>Label</th>
                <th>Timeline</th>
              </tr>
            </thead>
            <tbody>
              {remediation_plan.map((rem, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{rem.gap}</td>
                  <td>{rem.action}</td>
                  <td>
                    <span className={`badge badge-${rem.priority === 'critical' ? 'critical' : rem.priority === 'high' ? 'high' : rem.priority === 'low' ? 'low' : 'medium'}`}>
                      {rem.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${rem.label === 'mandatory' ? 'badge-critical' : rem.label === 'verify_first' ? 'badge-unknown' : 'badge-probable'}`}>
                      {rem.label?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{rem.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-tertiary)' }}>No remediation actions needed.</p>
        )}
      </div>
    </div>
  );
}
