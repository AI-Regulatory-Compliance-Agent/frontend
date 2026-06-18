/**
 * useAnalysis Hook — API interactions for the compliance analysis pipeline.
 *
 * Provides:
 *   - startAnalysis(formData): POST /analyze → returns session_id
 *   - getResult(analysisId): GET /analyze/result/{id} → returns full results
 *   - getHistory(): GET /history → returns past analyses list
 *   - getHistoryDetail(id): GET /history/{id} → returns full detail + company
 *   - downloadReport(id): GET /reports/{id}/download → triggers PDF download
 *   - loading: boolean
 *   - error: string or null
 *
 * Usage:
 *   const { startAnalysis, getResult, loading, error } = useAnalysis();
 *   const { session_id } = await startAnalysis(formData);
 */

import { useState, useCallback } from 'react';
import api from '../api/client';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Start Analysis ────────────────────────────────────────
  // POST /analyze → spawns the LangGraph pipeline in background
  // Returns: { session_id, message }
  const startAnalysis = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/analyze', formData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to start analysis';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Get Analysis Result ───────────────────────────────────
  // GET /analyze/result/{analysis_id}
  // Called after SSE signals completion
  const getResult = useCallback(async (analysisId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/analyze/result/${analysisId}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch results';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Get History ───────────────────────────────────────────
  // GET /history → list of past analyses for sidebar
  const getHistory = useCallback(async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch history:', err);
      return [];
    }
  }, []);

  // ── Get History Detail ────────────────────────────────────
  // GET /history/{id} → full analysis + company profile
  // Used for re-analysis form pre-fill
  const getHistoryDetail = useCallback(async (analysisId) => {
    setLoading(true);
    try {
      const response = await api.get(`/history/${analysisId}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch details';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Download PDF Report ───────────────────────────────────
  // GET /reports/{id}/download → triggers browser PDF download
  const downloadReport = useCallback(async (analysisId) => {
    try {
      const response = await api.get(`/reports/${analysisId}/download`, {
        responseType: 'blob', // Important: receive as binary blob
      });

      // Create a temporary download link and click it
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance_report_${analysisId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report');
      throw err;
    }
  }, []);

  return {
    startAnalysis,
    getResult,
    getHistory,
    getHistoryDetail,
    downloadReport,
    loading,
    error,
  };
}
