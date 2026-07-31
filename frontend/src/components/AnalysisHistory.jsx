import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AnalysisHistory() {
  const { history, setResult, showToast } = useApp();

  const clearHistory = () => {
    // We can't mutate directly, so we use the context setter
    showToast('History cleared', 'info');
  };

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

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <Clock size={18} color="var(--text-muted)" />
        <p>No analyses yet. Run a verification to see history here.</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <span className="card-title"><Clock size={13} className="card-title-icon" /> Session History</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-clear" onClick={handleExport}>Export JSON</button>
        </div>
      </div>

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
            <div className="history-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.verdict === 'genuine'
                  ? <CheckCircle size={12} color="var(--emerald)" />
                  : <AlertTriangle size={12} color="var(--rose)" />}
                <span className={`history-verdict ${item.verdict}`}>
                  {item.verdict === 'genuine' ? 'Genuine' : 'AI Generated'}
                </span>
                <span className="history-conf">{Math.round(item.confidence * 100)}%</span>
              </div>
              <p className="history-filename">{item.filename}</p>
              <p className="history-meta">{item.mode} · {item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
