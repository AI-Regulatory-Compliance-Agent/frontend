/**
 * AgentProgress — Visual progress indicator for the 5-agent pipeline.
 *
 * Shows a vertical stepper with:
 *   - Numbered circles (pending / active / completed)
 *   - Agent labels (user-friendly names)
 *   - Pulsing animation on the active step
 *   - Checkmarks on completed steps
 *
 * Reads progress state from the useSSE hook.
 */

export default function AgentProgress({ progress }) {
  const {
    currentAgent,
    status,
    completedAgents = [],
    totalSteps = 5,
  } = progress;

  // Agent steps in order
  const steps = [
    { key: 'regulation_identifier', label: 'Identifying Applicable Regulations', icon: '📜' },
    { key: 'gap_analysis', label: 'Analysing Compliance Gaps', icon: '🔍' },
    { key: 'risk_scoring', label: 'Scoring Risk Levels', icon: '📊' },
    { key: 'remediation', label: 'Generating Remediation Steps', icon: '🔧' },
    { key: 'report_generator', label: 'Building Final Report', icon: '📄' },
  ];

  const getStepState = (stepKey) => {
    if (completedAgents.includes(stepKey)) return 'completed';
    if (currentAgent === stepKey) return 'active';
    return 'pending';
  };

  // Overall progress percentage for the top bar
  const progressPercent = status === 'complete'
    ? 100
    : Math.round((completedAgents.length / totalSteps) * 100);

  return (
    <div className="card-glass animate-fade-in" style={{ padding: 'var(--space-xl)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>
          {status === 'complete' ? '✅ Analysis Complete' :
           status === 'failed' ? '❌ Analysis Failed' :
           '⏳ Analysis in Progress...'}
        </h3>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '4px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: status === 'failed' ? 'var(--risk-critical)' : 'var(--primary-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Steps */}
      <div className="progress-steps">
        {steps.map((step, index) => {
          const state = getStepState(step.key);
          return (
            <div key={step.key}
              className={`progress-step ${state}`}
              style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Step Icon */}
              <div className={`progress-step-icon ${state}`}>
                {state === 'completed' ? '✓' :
                 state === 'active' ? step.icon :
                 index + 1}
              </div>

              {/* Step Label */}
              <div>
                <div className={`progress-step-label ${state}`}>
                  {step.label}
                </div>
                {state === 'active' && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    marginTop: '2px',
                  }}>
                    Processing...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
