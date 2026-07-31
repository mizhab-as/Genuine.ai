import React from 'react';
import { CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BatchResults() {
  const { batchResults } = useApp();
  if (!batchResults) return null;

  const { total_files, processed, errors, ai_count, genuine_count, avg_confidence, results, total_time_ms } = batchResults;

  return (
    <div className="card animate-in" style={{ marginTop: 16 }}>
      <div className="card-header">
        <span className="card-title"><BarChart2 size={15} className="card-title-icon" /> Batch Results</span>
        <div className="batch-summary-chips">
          <span className="batch-chip ai">{ai_count} AI</span>
          <span className="batch-chip genuine">{genuine_count} Real</span>
          <span className="batch-chip neutral">{errors} Errors</span>
          <span className="batch-chip time">{total_time_ms}ms</span>
        </div>
      </div>

      {/* Aggregate stats */}
      <div className="batch-stats-row">
        <div className="batch-stat">
          <p className="batch-stat-val" style={{ color: 'var(--cyan)' }}>{processed}/{total_files}</p>
          <p className="batch-stat-label">Processed</p>
        </div>
        <div className="batch-stat">
          <p className="batch-stat-val" style={{ color: 'var(--emerald)' }}>{Math.round(avg_confidence * 100)}%</p>
          <p className="batch-stat-label">Avg Confidence</p>
        </div>
        <div className="batch-stat">
          <p className="batch-stat-val" style={{ color: ai_count > genuine_count ? 'var(--rose)' : 'var(--emerald)' }}>
            {ai_count > genuine_count ? 'AI Majority' : 'Real Majority'}
          </p>
          <p className="batch-stat-label">Batch Verdict</p>
        </div>
      </div>

      {/* Per-file results */}
      <div className="batch-results-list">
        {results.map((r, idx) => (
          <div key={idx} className={`batch-result-row ${r.verdict}`} id={`batch-result-${idx}`}>
            <div className="batch-result-icon">
              {r.verdict === 'genuine'
                ? <CheckCircle size={14} color="var(--emerald)" />
                : r.verdict === 'error'
                ? <AlertTriangle size={14} color="var(--amber)" />
                : <AlertTriangle size={14} color="var(--rose)" />}
            </div>
            <div className="batch-result-info">
              <span className="batch-result-filename">{r.filename}</span>
              {r.error
                ? <span className="batch-result-error">{r.error}</span>
                : <span className={`batch-result-verdict ${r.verdict}`}>
                    {r.verdict === 'ai_generated' ? 'AI Generated' : 'Genuine'} — {r.confidence_percentage}
                  </span>}
            </div>
            {r.freq_ai_score !== undefined && (
              <div className="batch-result-freq">
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>DCT</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
                  {Math.round(r.freq_ai_score * 100)}%
                </span>
              </div>
            )}
            <span className="batch-result-time">{r.analysis_time_ms}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
