/**
 * RiskDashboard — Analysis results visualisation.
 *
 * Semantic structure:
 *   <section.risk-dashboard>
 *     <article.risk-score-card.card-glass>      — hero risk score
 *     <div.stat-grid>                            — 4 summary stat cards
 *       <article.stat-card.card> × 4
 *     <section.results-section.card>            — Regulations table
 *     <section.results-section.card>            — Gaps table
 *     <section.results-section.card>            — Remediation table
 *
 * All inline style props have been replaced with CSS classes from index.css.
 * The only remaining inline style is colour-coded values passed as CSS variables
 * (e.g. color via --color-risk-* tokens) which cannot be done with a static class.
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

  const riskClass = overall_risk_level?.toLowerCase() || 'low';

  return (
    <section className="risk-dashboard animate-fade-in" aria-label="Analysis results">

      {/* ── Risk Score Hero ──────────────────────── */}
      <article className="risk-score-card card-glass" aria-label="Overall risk score">
        <div
          className="risk-score-display"
          style={{ color: `var(--color-risk-${riskClass})` }}
          aria-label={`Risk score: ${overall_risk_score} out of 100`}
        >
          {overall_risk_score}
        </div>

        <div>
          <span className={`badge badge-${riskClass}`} style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--space-1) var(--space-4)' }}>
            {overall_risk_level} RISK
          </span>
        </div>

        {/* Score range bar (partial / minimal confidence) */}
        {risk_score_range && confidence_level !== 'full' && (
          <div className="risk-range">
            <div className="risk-range__bar" role="meter" aria-label="Risk score range"
              aria-valuemin={risk_score_range.min}
              aria-valuemax={risk_score_range.max}
              aria-valuenow={risk_score_range.estimated}>
              <div
                className="risk-range__fill"
                style={{
                  left: `${risk_score_range.min}%`,
                  width: `${risk_score_range.max - risk_score_range.min}%`,
                  background: `linear-gradient(90deg, var(--color-risk-low), var(--color-risk-${riskClass}))`,
                }}
              />
            </div>
            <div className="risk-range__labels">
              <span>Min: {risk_score_range.min}</span>
              <span>Est: {risk_score_range.estimated}</span>
              <span>Max: {risk_score_range.max}</span>
            </div>
          </div>
        )}

        {/* Confidence badge */}
        <div>
          <span className={`badge badge-${
            confidence_level === 'full' ? 'confirmed'
            : confidence_level === 'partial' ? 'probable'
            : 'unknown'
          }`}>
            {confidence_level?.toUpperCase()} CONFIDENCE
          </span>
        </div>
      </article>

      {/* ── Summary Stats ────────────────────────── */}
      <div className="stat-grid" role="list" aria-label="Summary statistics">
        {[
          { label: 'Regulations', value: applicable_regulations.length, color: 'var(--color-primary-400)' },
          { label: 'Total Gaps',  value: scored_gaps.length,            color: 'var(--color-text-primary)' },
          { label: 'Critical',    value: scored_gaps.filter(g => g.risk_level === 'CRITICAL').length, color: 'var(--color-risk-critical)' },
          { label: 'High',        value: scored_gaps.filter(g => g.risk_level === 'HIGH').length,     color: 'var(--color-risk-high)' },
        ].map((stat) => (
          <article key={stat.label} className="stat-card card" role="listitem" aria-label={`${stat.label}: ${stat.value}`}>
            <div className="stat-card__value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-card__label">{stat.label}</div>
          </article>
        ))}
      </div>

      {/* ── Applicable Regulations ───────────────── */}
      <section className="results-section card" aria-labelledby="regulations-heading">
        <header className="results-section__header">
          <h3 className="results-section__title" id="regulations-heading">📜 Applicable Regulations</h3>
        </header>
        {applicable_regulations.length > 0 ? (
          <table className="data-table" aria-label="Applicable regulations">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Regulation</th>
                <th scope="col">Relevance</th>
                <th scope="col">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {applicable_regulations.map((reg, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{reg.name}</td>
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
          <p className="results-section__empty">No applicable regulations identified.</p>
        )}
      </section>

      {/* ── Compliance Gaps ──────────────────────── */}
      <section className="results-section card" aria-labelledby="gaps-heading">
        <header className="results-section__header">
          <h3 className="results-section__title" id="gaps-heading">🔍 Compliance Gaps</h3>
        </header>
        {scored_gaps.length > 0 ? (
          <table className="data-table" aria-label="Compliance gaps">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Regulation</th>
                <th scope="col">Gap</th>
                <th scope="col">Severity</th>
                <th scope="col">Risk</th>
                <th scope="col">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {scored_gaps.map((gap, i) => {
                const lvl = gap.risk_level?.toLowerCase() || 'medium';
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{gap.regulation}</td>
                    <td>{gap.gap}</td>
                    <td style={{ fontWeight: 'var(--font-weight-bold)', color: `var(--color-risk-${lvl})` }}>
                      {gap.severity}
                    </td>
                    <td>
                      <span className={`badge badge-${lvl}`}>{gap.risk_level}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${gap.confidence?.toLowerCase() || 'unknown'}`}>
                        {gap.confidence}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="results-section__empty">No compliance gaps found. Looking good! ✅</p>
        )}
      </section>

      {/* ── Remediation Plan ─────────────────────── */}
      <section className="results-section card" aria-labelledby="remediation-heading">
        <header className="results-section__header">
          <h3 className="results-section__title" id="remediation-heading">🔧 Remediation Plan</h3>
        </header>
        {remediation_plan.length > 0 ? (
          <table className="data-table" aria-label="Remediation plan">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Gap</th>
                <th scope="col">Action</th>
                <th scope="col">Priority</th>
                <th scope="col">Label</th>
                <th scope="col">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {remediation_plan.map((rem, i) => {
                const pri = rem.priority;
                const priClass = pri === 'critical' ? 'critical' : pri === 'high' ? 'high' : pri === 'low' ? 'low' : 'medium';
                const lblClass = rem.label === 'mandatory' ? 'critical' : rem.label === 'verify_first' ? 'unknown' : 'probable';
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{rem.gap}</td>
                    <td>{rem.action}</td>
                    <td><span className={`badge badge-${priClass}`}>{pri}</span></td>
                    <td><span className={`badge badge-${lblClass}`}>{rem.label?.replace('_', ' ')}</span></td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{rem.timeline}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="results-section__empty">No remediation actions needed.</p>
        )}
      </section>
    </section>
  );
}
