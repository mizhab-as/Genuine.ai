import React from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AnalysisHistory() {
  const { history, showToast } = useApp();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `genuine-ai-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported as JSON', 'success');
  };

  return (
    <div className="card history-panel">
      <div className="card-header" style={{ marginBottom: history.length > 0 ? 14 : 0 }}>
        <span className="card-title">
          <Clock size={15} className="card-title-icon" /> Session History
        </span>
        {history.length > 0 && (
          <button className="btn-clear" onClick={handleExport}>Export JSON</button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0 0', color: 'var(--text-dim)', fontSize: 13 }}>
          <Clock size={16} color="var(--text-muted)" />
          <span>No analyses yet in this session. Run a verification to track history.</span>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, idx) => (
            <div key={item.id || idx} className="history-item" id={`history-item-${idx}`}>
              {/* Thumbnail */}
              {item.preview && (
                <div className="history-thumb">
                  <img src={item.preview} alt="thumb" />
                </div>
              )}

              {/* Info */}
              <div className="history-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.verdict === 'genuine'
                    ? <CheckCircle size={12} color="var(--teal)" />
                    : <AlertTriangle size={12} color="var(--brick)" />}
                  <span className={`history-verdict ${item.verdict}`}>
                    {item.verdict === 'genuine' ? 'Genuine' : 'AI Generated'}
                  </span>
                  <span className="history-conf" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                <p className="history-filename" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0' }}>
                  {item.filename}
                </p>
                <p className="history-meta" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {item.mode} · {item.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
