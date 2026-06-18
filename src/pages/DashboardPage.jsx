/**
 * DashboardPage — Main layout with sidebar + content.
 *
 * FIXED: useEffect dependency loop that caused form to remount.
 * History loading is now independent of URL param handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RiskDashboard from '../components/RiskDashboard';
import ReportDownload from '../components/ReportDownload';
import AnalysisPage from './AnalysisPage';
import { useAnalysis } from '../hooks/useAnalysis';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getResult, getHistory, getHistoryDetail } = useAnalysis();

  const [history, setHistory] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [view, setView] = useState('welcome');

  // Refs to prevent useEffect dependency issues
  const getResultRef = useRef(getResult);
  const getHistoryRef = useRef(getHistory);
  const getHistoryDetailRef = useRef(getHistoryDetail);
  getResultRef.current = getResult;
  getHistoryRef.current = getHistory;
  getHistoryDetailRef.current = getHistoryDetail;

  // ── Load History (once on mount) ──────────────────────
  useEffect(() => {
    const load = async () => {
      const items = await getHistoryRef.current();
      setHistory(items);
    };
    load();
  }, []); // Only on mount

  // ── Handle URL params (once on mount) ─────────────────
  // Using a ref flag to prevent re-processing
  const paramsProcessed = useRef(false);
  useEffect(() => {
    if (paramsProcessed.current) return;
    const analysisId = searchParams.get('analysis');
    const isNew = searchParams.get('new');
    const updateId = searchParams.get('update');

    if (analysisId) {
      paramsProcessed.current = true;
      handleSelectAnalysis(analysisId);
    } else if (updateId) {
      paramsProcessed.current = true;
      handleUpdateAnalysis(updateId);
    } else if (isNew) {
      paramsProcessed.current = true;
      setView('new');
      setPrefillData(null);
    }
  }, [searchParams]);

  // ── Select an analysis to view ────────────────────────
  const handleSelectAnalysis = useCallback(async (id) => {
    setActiveId(id);
    try {
      const result = await getResultRef.current(id);
      setActiveAnalysis(result);
      setView('results');
    } catch (err) {
      console.error('Failed to load analysis:', err);
    }
  }, []);

  // ── Start new analysis ────────────────────────────────
  const handleNewAnalysis = useCallback(() => {
    setPrefillData(null);
    setActiveId(null);
    setView('new');
    paramsProcessed.current = true;
    navigate('/dashboard?new=true', { replace: true });
  }, [navigate]);

  // ── Update analysis ───────────────────────────────────
  const handleUpdateAnalysis = useCallback(async (id) => {
    try {
      const detail = await getHistoryDetailRef.current(id);
      if (detail?.company) {
        setPrefillData(detail.company);
        setView('update');
        paramsProcessed.current = true;
        navigate(`/dashboard?update=${id}`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to load company profile:', err);
    }
  }, [navigate]);

  // ── On analysis complete ──────────────────────────────
  const handleAnalysisComplete = useCallback(async (analysisId) => {
    // Reload history
    const items = await getHistoryRef.current();
    setHistory(items);
    setActiveId(analysisId);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        history={history}
        activeId={activeId}
        onSelect={handleSelectAnalysis}
        onNewAnalysis={handleNewAnalysis}
        onUpdateAnalysis={handleUpdateAnalysis}
      />

      <div className="main-content">
        {view === 'welcome' && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center',
          }} className="animate-fade-in">
            <div className="logo-large" style={{ marginBottom: 'var(--space-lg)' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="16" fill="url(#logo-grad)" />
                <path d="M32 16L44 24V40L32 48L20 40V24L32 16Z" stroke="white" strokeWidth="2.5" fill="none" />
                <path d="M28 32L31 35L37 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 style={{ marginBottom: 'var(--space-sm)' }}>
              AI Regulatory Compliance Agent
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: 'var(--space-xl)' }}>
              Describe a company and our AI agents will analyse it against stored
              government regulations to identify compliance gaps, risk levels,
              and remediation steps.
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleNewAnalysis}>
              Start Your First Analysis
            </button>
          </div>
        )}

        {view === 'results' && activeAnalysis && (
          <div>
            {/* Show error banner for failed analyses */}
            {activeAnalysis.status === 'failed' ? (
              <div className="animate-fade-in" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: '40vh', textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
                <h2 style={{ marginBottom: 'var(--space-sm)' }}>Analysis Failed</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: 'var(--space-lg)' }}>
                  This analysis was unable to complete. This usually happens due to
                  API rate limits or network issues. You can retry the analysis.
                </p>
                <button className="btn btn-primary" onClick={handleNewAnalysis}>
                  Start New Analysis
                </button>
              </div>
            ) : activeAnalysis.status === 'pending' || activeAnalysis.status === 'running' ? (
              <div className="animate-fade-in" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: '40vh', textAlign: 'center',
              }}>
                <div className="spinner" style={{ width: 40, height: 40, marginBottom: 'var(--space-lg)' }} />
                <h2 style={{ marginBottom: 'var(--space-sm)' }}>Analysis In Progress</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This analysis is still running. Results will appear here when complete.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 'var(--space-xl)',
                }}>
                  <div>
                    <h1 style={{ marginBottom: 'var(--space-xs)' }}>Analysis Results</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {activeAnalysis.analysis_type?.toUpperCase()} analysis
                      {activeAnalysis.confidence_level && ` · ${activeAnalysis.confidence_level.toUpperCase()} confidence`}
                    </p>
                  </div>
                  <ReportDownload analysisId={activeId} />
                </div>
                <RiskDashboard analysis={activeAnalysis} />
              </>
            )}
          </div>
        )}

        {view === 'new' && (
          <AnalysisPage onComplete={handleAnalysisComplete} />
        )}

        {view === 'update' && (
          <AnalysisPage
            prefillData={prefillData}
            onComplete={handleAnalysisComplete}
          />
        )}
      </div>
    </div>
  );
}
