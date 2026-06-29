/**
 * AnalysisPage — Form + progress view for compliance analysis.
 *
 * Semantic structure:
 *   <main.analysis-page>
 *     <header.page-header>
 *     <div.card> (form, when not analysing)
 *       <CompanyForm>
 *     <AgentProgress> (when analysing)
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
  const [analysisMode, setAnalysisMode] = useState('self');

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

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

  const handleSubmit = useCallback(async (formData) => {
    setFormError(null);
    setAnalysisMode(formData.analysis_mode || 'self');
    try {
      const result = await startAnalysis(formData);
      if (result?.session_id) {
        setIsAnalysing(true);
        connect(result.session_id);
      } else {
        setFormError('Unexpected server response. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to start analysis. Is the backend running?';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [startAnalysis, connect]);

  return (
    <main className="analysis-page">
      {/* ── Page header ─────────────────────────── */}
      <header className="page-header">
        <div className="page-header__titles">
          <h1>{prefillData ? 'Update Analysis' : 'New Analysis'}</h1>
          <p>
            {prefillData
              ? 'Update the company profile and re-run the analysis.'
              : 'Describe a company and our AI agents will identify compliance gaps.'}
          </p>
        </div>
      </header>

      {/* ── Form / Progress ──────────────────────── */}
      {isAnalysing ? (
        <AgentProgress progress={progress} analysisMode={analysisMode} />
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
    </main>
  );
}
