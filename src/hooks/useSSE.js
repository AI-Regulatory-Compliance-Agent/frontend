/**
 * useSSE Hook — Server-Sent Events for real-time agent progress.
 *
 * Uses the NATIVE browser EventSource API (NOT WebSockets).
 * EventSource automatically handles:
 *   - Connection establishment
 *   - Auto-reconnection on disconnect
 *   - Message parsing
 *
 * Flow:
 *   1. Component calls connect(sessionId)
 *   2. Hook opens EventSource to /analysis/stream/{sessionId}
 *   3. As agents run, hook updates progress state
 *   4. When status is "complete", calls onComplete callback
 *   5. Connection is automatically closed
 *
 * Usage:
 *   const { progress, isConnected, connect, disconnect } = useSSE({
 *     onComplete: (analysisId) => { navigate to results },
 *     onError: (error) => { show error toast }
 *   });
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../api/client';

// ── Agent display names and order ───────────────────────────
// Maps internal agent names to user-friendly labels
const AGENT_LABELS = {
  regulation_identifier: 'Identifying Regulations',
  gap_analysis: 'Analysing Compliance Gaps',
  risk_scoring: 'Scoring Risk Levels',
  remediation: 'Generating Remediation Plan',
  report_generator: 'Generating Report',
};

// Ordered list of agent steps for the progress indicator
const AGENT_ORDER = [
  'regulation_identifier',
  'gap_analysis',
  'risk_scoring',
  'remediation',
  'report_generator',
];

export function useSSE({ onComplete, onError } = {}) {
  // ── State ─────────────────────────────────────────────────
  const [progress, setProgress] = useState({
    currentAgent: '',
    currentAgentLabel: '',
    status: 'idle',         // idle / connecting / running / complete / failed
    analysisId: null,
    completedAgents: [],    // list of completed agent names
    currentStep: 0,         // 0-4 index into AGENT_ORDER
    totalSteps: AGENT_ORDER.length,
  });

  const [isConnected, setIsConnected] = useState(false);

  // Ref to hold the EventSource instance
  // Using ref instead of state because we don't want re-renders
  // when the EventSource object changes, only when messages arrive.
  const eventSourceRef = useRef(null);

  // ── Connect to SSE Stream ────────────────────────────────
  const connect = useCallback((sessionId) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setProgress({
      currentAgent: '',
      currentAgentLabel: 'Starting analysis...',
      status: 'connecting',
      analysisId: null,
      completedAgents: [],
      currentStep: 0,
      totalSteps: AGENT_ORDER.length,
    });

    // ── Create EventSource ──────────────────────────────────
    // This is the native browser API for SSE.
    // No libraries needed. The browser handles the HTTP connection,
    // reconnection, and message parsing automatically.
    const url = `${API_BASE_URL}/analysis/stream/${sessionId}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // ── On Open ─────────────────────────────────────────────
    es.onopen = () => {
      setIsConnected(true);
      setProgress(prev => ({ ...prev, status: 'running' }));
    };

    // ── On Message ──────────────────────────────────────────
    // Each message from the SSE endpoint has the format:
    //   data: {"current_agent": "gap_analysis", "status": "running"}
    // The EventSource API parses the "data: " prefix automatically.
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const agent = data.current_agent || '';
        const status = data.status || '';

        if (status === 'complete' && data.analysis_id) {
          // ── Analysis Complete ──────────────────────────────
          // All 5 agents finished. Close connection and notify.
          setProgress(prev => ({
            ...prev,
            currentAgent: agent,
            currentAgentLabel: 'Analysis complete!',
            status: 'complete',
            analysisId: data.analysis_id,
            completedAgents: [...AGENT_ORDER],
            currentStep: AGENT_ORDER.length,
          }));

          es.close();
          setIsConnected(false);

          // Callback to parent component
          if (onComplete) onComplete(data.analysis_id);

        } else if (status === 'failed') {
          // ── Agent Failed ──────────────────────────────────
          setProgress(prev => ({
            ...prev,
            currentAgent: agent,
            currentAgentLabel: `Failed at: ${AGENT_LABELS[agent] || agent}`,
            status: 'failed',
          }));

          es.close();
          setIsConnected(false);

          if (onError) onError(data.error || 'Analysis failed');

        } else {
          // ── Progress Update ────────────────────────────────
          // An agent is either "running" or just "complete"d
          const stepIndex = AGENT_ORDER.indexOf(agent);
          const completed = AGENT_ORDER.slice(0, stepIndex);

          // If an agent completed, add it to the completed list
          if (status === 'complete' && agent) {
            completed.push(agent);
          }

          setProgress(prev => ({
            ...prev,
            currentAgent: agent,
            currentAgentLabel: AGENT_LABELS[agent] || agent,
            status: 'running',
            completedAgents: completed,
            currentStep: stepIndex >= 0 ? stepIndex : prev.currentStep,
          }));
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    // ── On Error ────────────────────────────────────────────
    // EventSource automatically tries to reconnect on error.
    // We only handle permanent failures here.
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setIsConnected(false);
        // Only set failed if we weren't already complete
        setProgress(prev => {
          if (prev.status !== 'complete') {
            return { ...prev, status: 'failed' };
          }
          return prev;
        });
      }
    };
  }, [onComplete, onError]);

  // ── Disconnect ────────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // ── Cleanup on Unmount ────────────────────────────────────
  // Close the EventSource when the component unmounts to prevent
  // memory leaks and zombie connections.
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    progress,
    isConnected,
    connect,
    disconnect,
    agentLabels: AGENT_LABELS,
    agentOrder: AGENT_ORDER,
  };
}
