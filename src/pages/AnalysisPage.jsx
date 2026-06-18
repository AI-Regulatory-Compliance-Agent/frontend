/**
 * AnalysisPage — Form + progress view for compliance analysis.
 *
 * CRITICAL FIX: Error state is now displayed to the user instead of
 * being silently swallowed. The component manages its own error state
 * and passes it down to CompanyForm for display.
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../components/CompanyForm';
import AgentProgress from '../components/AgentProgress';
import { useAnalysis } from '../hooks/useAnalysis';
import { useSSE } from '../hooks/useSSE';

export default function AnalysisPage({ prefillData, onComplete }) {
  const navigate = useNavigate();
  const { startAnalysis, loading } = useAnalysis();
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [formError, setFormError] = useState(null);

  // Use ref for onComplete to avoid re-creating SSE hook
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // SSE hook with stable callbacks via refs
  const { progress, connect } = useSSE({
    onComplete: (analysisId) => {
      if (onCompleteRef.current) onCompleteRef.current(analysisId);
      navigate(`/dashboard?analysis=${analysisId}`);
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
      setFormError(`Analysis pipeline failed: ${error}`);
      setIsAnalysing(false);
    },
  });

  // Handle form submission — shows errors instead of swallowing them
  const handleSubmit = useCallback(async (formData) => {
    setFormError(null);
    try {
      const result = await startAnalysis(formData);
      if (result && result.session_id) {
        setIsAnalysing(true);
        connect(result.session_id);
      } else {
        setFormError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      // Show the actual error to the user
      const msg = err.response?.data?.detail || err.message || 'Failed to start analysis. Is the backend running?';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      console.error('Failed to start analysis:', err);
    }
  }, [startAnalysis, connect]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-xs)' }}>
          {prefillData ? 'Update Analysis' : 'New Analysis'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {prefillData
            ? 'Update the company profile with new information and re-run the analysis.'
            : 'Describe a company and our AI agents will identify compliance gaps.'}
        </p>
      </div>

      {/* Show progress or form */}
      {isAnalysing ? (
        <AgentProgress progress={progress} />
      ) : (
        <div className="card">
          <CompanyForm
            onSubmit={handleSubmit}
            loading={loading}
            prefillData={prefillData}
            error={formError}
          />
        </div>
      )}
    </div>
  );
}
