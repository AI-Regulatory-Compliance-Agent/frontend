/**
 * DashboardPage — Main layout with sidebar, results dashboard, and report download.
 *
 * This is the primary authenticated view. It contains:
 *   1. Sidebar (fixed left) — past analyses + navigation
 *   2. Main content — either welcome screen, results dashboard, or analysis form
 *
 * URL params:
 *   ?analysis={id} — load specific analysis results
 *   ?new=true — show new analysis form
 *   ?update={id} — show form pre-filled with analysis's company profile
 */

import { useState, useEffect, useCallback } from 'react';
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

  // ── State ─────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [view, setView] = useState('welcome'); // welcome / results / new / update

  // ── Load History ──────────────────────────────────────
  const loadHistory = useCallback(async () => {
    const items = await getHistory();
    setHistory(items);
  }, [getHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Handle URL params ─────────────────────────────────
  useEffect(() => {
    const analysisId = searchParams.get('analysis');
    const isNew = searchParams.get('new');
    const updateId = searchParams.get('update');

    if (analysisId) {
      handleSelectAnalysis(analysisId);
    } else if (updateId) {
      handleUpdateAnalysis(updateId);
    } else if (isNew) {
      setView('new');
      setPrefillData(null);
    }
  }, [searchParams]);

  // ── Select an analysis to view ────────────────────────
  const handleSelectAnalysis = useCallback(async (id) => {
    setActiveId(id);
    try {
      const result = await getResult(id);
      setActiveAnalysis(result);
      setView('results');
    } catch (err) {
      console.error('Failed to load analysis:', err);
    }
  }, [getResult]);

  // ── Start new analysis ────────────────────────────────
  const handleNewAnalysis = useCallback(() => {
    setPrefillData(null);
    setActiveId(null);
    setView('new');
    navigate('/dashboard?new=true');
  }, [navigate]);

  // ── Update analysis (re-analysis with prefill) ────────
  const handleUpdateAnalysis = useCallback(async (id) => {
    try {
      const detail = await getHistoryDetail(id);
      if (detail?.company) {
        setPrefillData(detail.company);
        setView('update');
        navigate(`/dashboard?update=${id}`);
      }
    } catch (err) {
      console.error('Failed to load company profile:', err);
    }
  }, [getHistoryDetail, navigate]);

  // ── On analysis complete (refresh history) ────────────
  const handleAnalysisComplete = useCallback((analysisId) => {
    loadHistory();
    setActiveId(analysisId);
  }, [loadHistory]);

  return (
    <div className="app-layout">
      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar
        history={history}
        activeId={activeId}
        onSelect={handleSelectAnalysis}
        onNewAnalysis={handleNewAnalysis}
        onUpdateAnalysis={handleUpdateAnalysis}
      />

      {/* ── Main Content ─────────────────────────────── */}
      <div className="main-content">
        {/* Welcome view */}
        {view === 'welcome' && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center',
          }} className="animate-fade-in">
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🛡️</div>
            <h1 style={{ marginBottom: 'var(--space-sm)' }}>
              AI Regulatory Compliance Agent
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: 'var(--space-xl)' }}>
              Describe a company and our AI agents will analyse it against stored
              government regulations to identify compliance gaps, risk levels,
              and remediation steps.
            </p>
            <button className="btn btn-primary btn-lg" onClick={handleNewAnalysis}>
              🚀 Start Your First Analysis
            </button>
          </div>
        )}

        {/* Results view */}
        {view === 'results' && activeAnalysis && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 'var(--space-xl)',
            }}>
              <div>
                <h1 style={{ marginBottom: 'var(--space-xs)' }}>Analysis Results</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {activeAnalysis.analysis_type?.toUpperCase()} analysis
                  {activeAnalysis.confidence_level && ` • ${activeAnalysis.confidence_level.toUpperCase()} confidence`}
                </p>
              </div>
              <ReportDownload analysisId={activeId} />
            </div>
            <RiskDashboard analysis={activeAnalysis} />
          </div>
        )}

        {/* New analysis view */}
        {view === 'new' && (
          <AnalysisPage onComplete={handleAnalysisComplete} />
        )}

        {/* Update analysis view */}
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
