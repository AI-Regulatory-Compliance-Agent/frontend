/**
 * ReportDownload — PDF download button component.
 *
 * Shows a styled download button that triggers the PDF download
 * via the useAnalysis hook's downloadReport function.
 */

import { useState } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';

export default function ReportDownload({ analysisId }) {
  const { downloadReport } = useAnalysis();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReport(analysisId);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleDownload}
      disabled={downloading || !analysisId}>
      {downloading ? (
        <><span className="spinner" /> Downloading...</>
      ) : (
        '📥 Download PDF Report'
      )}
    </button>
  );
}
