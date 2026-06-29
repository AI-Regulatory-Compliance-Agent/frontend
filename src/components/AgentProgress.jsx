/**
 * AgentProgress — SSE progress stepper for the 5-agent pipeline.
 *
 * All inline style props replaced with CSS classes from index.css.
 * External research mode: renders progress__badge--external pill and
 * per-step sublabels using progress__sublabel / progress__sublabel--external.
 */

export default function AgentProgress({ progress, analysisMode = 'self' }) {
  const {
    currentAgent,
    status,
    completedAgents = [],
    totalSteps = 5,
  } = progress;

  const isExternal = analysisMode === 'external';

  const steps = [
    {
      key: 'regulation_identifier',
      label: 'Identifying Applicable Regulations',
      icon: '📜',
      externalSublabel: '🌐 Web searching the company...',
    },
    {
      key: 'gap_analysis',
      label: 'Analysing Compliance Gaps',
      icon: '🔍',
      externalSublabel: null,
    },
    {
      key: 'risk_scoring',
      label: 'Scoring Risk Levels',
      icon: '📊',
      externalSublabel: '🌐 Checking enforcement precedents...',
    },
    {
      key: 'remediation',
      label: 'Generating Remediation Steps',
      icon: '🔧',
      externalSublabel: null,
    },
    {
      key: 'report_generator',
      label: 'Building Final Report',
      icon: '📄',
      externalSublabel: null,
    },
  ];

  const getStepState = (stepKey) => {
    if (completedAgents.includes(stepKey)) return 'completed';
    if (currentAgent === stepKey) return 'active';
    return 'pending';
  };

  const progressPercent = status === 'complete'
    ? 100
    : Math.round((completedAgents.length / totalSteps) * 100);

  const isFinished = status === 'complete' || status === 'failed';

  return (
    <div className="card-glass animate-fade-in" style={{ padding: 'var(--space-8)' }}>

      {/* ── Header ──────────────────────────────── */}
      <div className="progress__header">
        <h3 className="progress__title">
          {status === 'complete' ? '✅ Analysis Complete'
           : status === 'failed' ? '❌ Analysis Failed'
           : '⏳ Analysis in Progress...'}
        </h3>

        {/* External Research badge — visible while running */}
        {isExternal && !isFinished && (
          <div
            className="progress__badge--external"
            role="status"
            aria-label="External research mode active"
          >
            🌐 Web Research Active
          </div>
        )}

        {/* Progress bar */}
        <div className="progress__bar-track" role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Analysis progress">
          <div
            className={`progress__bar-fill${status === 'failed' ? ' progress__bar-fill--failed' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Steps ───────────────────────────────── */}
      <ol className="progress__steps" aria-label="Pipeline steps">
        {steps.map((step, index) => {
          const state = getStepState(step.key);
          const sublabel = state === 'active'
            ? (isExternal && step.externalSublabel ? step.externalSublabel : 'Processing...')
            : null;
          const sublabelIsExternal = isExternal && step.externalSublabel && state === 'active';

          return (
            <li
              key={step.key}
              className={`progress__step progress__step--${state}`}
              aria-label={`Step ${index + 1}: ${step.label} — ${state}`}
            >
              {/* Step icon */}
              <div className={`progress__step-icon progress__step-icon--${state}`} aria-hidden="true">
                {state === 'completed' ? '✓' : state === 'active' ? step.icon : index + 1}
              </div>

              {/* Step text */}
              <div>
                <div className={`progress__step-label progress__step-label--${state}`}>
                  {step.label}
                </div>
                {sublabel && (
                  <div className={`progress__sublabel${sublabelIsExternal ? ' progress__sublabel--external' : ''}`}>
                    {sublabel}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
