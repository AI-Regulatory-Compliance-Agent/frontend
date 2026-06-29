/**
 * DashboardPage — App shell: sidebar + main content area.
 *
 * Semantic structure:
 *   <div.app-layout>
 *     <div.sidebar-backdrop> (mobile overlay)
 *     <button.sidebar-hamburger> (mobile only)
 *     <Sidebar>
 *     <main.app-layout__main>
 *       <section.welcome>          (view: welcome)
 *       <div>                      (view: results)
 *         <header.page-header>
 *         <RiskDashboard>
 *       <AnalysisPage>             (view: new / update)
 *
 * Mobile sidebar: controlled by `sidebarOpen` state.
 * Hamburger button shows on < 768px, backdrop closes sidebar on tap.
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
  const { getResult, getHistory, getHistoryDetail, downloadReport } = useAnalysis();

  const [history, setHistory] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [view, setView] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stable refs to avoid stale closure issues in effects
  const getResultRef = useRef(getResult);
  const getHistoryRef = useRef(getHistory);
  const getHistoryDetailRef = useRef(getHistoryDetail);
  const downloadReportRef = useRef(downloadReport);
  getResultRef.current = getResult;
  getHistoryRef.current = getHistory;
  getHistoryDetailRef.current = getHistoryDetail;
  downloadReportRef.current = downloadReport;

  // Load history once on mount
  useEffect(() => {
    getHistoryRef.current().then(setHistory).catch(console.error);
  }, []);

  // Handle URL params once on mount
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

  // Close sidebar when view changes (mobile UX)
  useEffect(() => { setSidebarOpen(false); }, [view]);

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

  const handleNewAnalysis = useCallback(() => {
    setPrefillData(null);
    setActiveId(null);
    setView('new');
    paramsProcessed.current = true;
    navigate('/dashboard?new=true', { replace: true });
  }, [navigate]);

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

  const handleAnalysisComplete = useCallback(async (analysisId) => {
    const items = await getHistoryRef.current();
    setHistory(items);
    setActiveId(analysisId);
    try {
      const result = await getResultRef.current(analysisId);
      setActiveAnalysis(result);
      setView('results');
      setTimeout(async () => {
        try { await downloadReportRef.current(analysisId); }
        catch (err) { console.error('Auto-download failed:', err); }
      }, 2000);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  }, []);

  return (
    <div className="app-layout">
      {/* Mobile backdrop — closes sidebar on tap */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Hamburger (visible only on mobile via CSS) */}
      <button
        className="sidebar-hamburger"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <Sidebar
        id="sidebar"
        isOpen={sidebarOpen}
        history={history}
        activeId={activeId}
        onSelect={handleSelectAnalysis}
        onNewAnalysis={handleNewAnalysis}
        onUpdateAnalysis={handleUpdateAnalysis}
      />

      {/* Main content */}
      <main className="app-layout__main">

        {/* ── Welcome view ──────────────────────────── */}
        {view === 'welcome' && (
          <section className="welcome animate-fade-in" aria-label="Welcome">
            <div className="welcome__logo" aria-hidden="true">
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
            <h1 className="welcome__title">AI Regulatory Compliance Agent</h1>
            <p className="welcome__description">
              Describe a company and our AI agents will analyse it against stored
              government regulations to identify compliance gaps, risk levels,
              and remediation steps.
            </p>
            <button className="btn btn-primary btn--lg" onClick={handleNewAnalysis}>
              Start Your First Analysis
            </button>
          </section>
        )}

        {/* ── Results view ──────────────────────────── */}
        {view === 'results' && activeAnalysis && (
          <div className="animate-fade-in">
            {activeAnalysis.status === 'failed' ? (
              <section className="state-view" aria-label="Analysis failed">
                <div className="state-view__icon" aria-hidden>⚠️</div>
                <h2 className="state-view__title">Analysis Failed</h2>
                <p className="state-view__description">
                  This analysis was unable to complete. This usually happens due to
                  API rate limits or network issues. You can retry the analysis.
                </p>
                <button className="btn btn-primary" onClick={handleNewAnalysis}>
                  Start New Analysis
                </button>
              </section>
            ) : activeAnalysis.status === 'pending' || activeAnalysis.status === 'running' ? (
              <section className="state-view" aria-label="Analysis in progress">
                <div aria-hidden>
                  <span className="spinner" style={{ width: 40, height: 40 }} />
                </div>
                <h2 className="state-view__title">Analysis In Progress</h2>
                <p className="state-view__description">
                  This analysis is still running. Results will appear here when complete.
                </p>
              </section>
            ) : (
              <>
                <header className="page-header">
                  <div className="page-header__titles">
                    <h1>Analysis Results</h1>
                    <p>
                      {activeAnalysis.analysis_type?.toUpperCase()} analysis
                      {activeAnalysis.confidence_level && ` · ${activeAnalysis.confidence_level.toUpperCase()} confidence`}
                    </p>
                  </div>
                  <div className="page-header__actions">
                    <ReportDownload analysisId={activeId} />
                  </div>
                </header>
                <RiskDashboard analysis={activeAnalysis} />
              </>
            )}
          </div>
        )}

        {/* ── New analysis view ─────────────────────── */}
        {view === 'new' && (
          <AnalysisPage onComplete={handleAnalysisComplete} />
        )}

        {/* ── Update analysis view ──────────────────── */}
        {view === 'update' && (
          <AnalysisPage prefillData={prefillData} onComplete={handleAnalysisComplete} />
        )}
      </main>
    </div>
  );
}
