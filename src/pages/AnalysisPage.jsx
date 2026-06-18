/**
 * AnalysisPage — Where the user fills the form and watches agent progress.
 *
 * Two views:
 *   1. Form view — CompanyForm for input (default)
 *   2. Progress view — AgentProgress stepper during analysis
 *
 * Flow:
 *   User fills form → submit → POST /analyze → switch to progress view
 *   → SSE events update progress → on complete → navigate to dashboard
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../components/CompanyForm';
import AgentProgress from '../components/AgentProgress';
import { useAnalysis } from '../hooks/useAnalysis';
import { useSSE } from '../hooks/useSSE';

export default function AnalysisPage({ prefillData, onComplete }) {
  const navigate = useNavigate();
  const { startAnalysis, loading } = useAnalysis();
  const [isAnalysing, setIsAnalysing] = useState(false);

  // SSE hook with completion callback
  const { progress, connect } = useSSE({
    onComplete: (analysisId) => {
      // Analysis finished — navigate to dashboard with this result
      if (onComplete) onComplete(analysisId);
      navigate(`/dashboard?analysis=${analysisId}`);
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
      setIsAnalysing(false);
    },
  });

  // Handle form submission
  const handleSubmit = useCallback(async (formData) => {
    try {
      const result = await startAnalysis(formData);
      setIsAnalysing(true);
      // Connect to SSE stream with the returned session_id
      connect(result.session_id);
    } catch (err) {
      console.error('Failed to start analysis:', err);
    }
  }, [startAnalysis, connect]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ marginBottom: 'var(--space-xs)' }}>
          {prefillData ? '↻ Update Analysis' : '🚀 New Analysis'}
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
          />
        </div>
      )}
    </div>
  );
}
