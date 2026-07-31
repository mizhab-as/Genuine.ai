import React, { useRef, useState } from 'react';
import { UploadCloud, RefreshCw, Zap, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BatchUpload() {
  const { API_BASE_URL, showToast, setBatchResults } = useApp();
  const [files,     setFiles]     = useState([]);
  const [running,   setRunning]   = useState(false);
  const [progress,  setProgress]  = useState('');
  const inputRef = useRef(null);

  const handleFiles = e => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
    setBatchResults(null);
  };

  const runBatch = async () => {
    if (files.length === 0) return;
    setRunning(true);
    setProgress(`Analyzing ${files.length} images in parallel…`);

    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      const res  = await fetch(`${API_BASE_URL}/api/v1/analyze-batch`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBatchResults(data);
      showToast(`Batch complete: ${data.ai_count} AI, ${data.genuine_count} real`, 'success');
    } catch {
      // Demo fallback
      const fakeResults = files.map((f, i) => {
        const isAI = Math.random() > 0.5;
        return {
          filename:             f.name,
          index:                i,
          verdict:              isAI ? 'ai_generated' : 'genuine',
          confidence:           parseFloat((0.80 + Math.random() * 0.18).toFixed(4)),
          confidence_percentage:`${Math.round((0.80 + Math.random() * 0.18) * 100)}%`,
          freq_ai_score:        parseFloat((Math.random()).toFixed(4)),
          grid_artifact_score:  parseFloat((Math.random()).toFixed(4)),
          analysis_time_ms:     parseFloat((15 + Math.random() * 40).toFixed(1)),
        };
      });
      const aiCount  = fakeResults.filter(r => r.verdict === 'ai_generated').length;
      const genCount = fakeResults.filter(r => r.verdict === 'genuine').length;
      setBatchResults({
        total_files:    files.length,
        processed:      files.length,
        errors:         0,
        ai_count:       aiCount,
        genuine_count:  genCount,
        avg_confidence: parseFloat((fakeResults.reduce((s, r) => s + r.confidence, 0) / fakeResults.length).toFixed(4)),
        results:        fakeResults,
        total_time_ms:  parseFloat((50 + Math.random() * 100).toFixed(1)),
      });
      showToast('API offline — showing demo batch result', 'warning');
    } finally {
      setRunning(false);
      setProgress('');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <BarChart2 size={15} className="card-title-icon" /> Batch Analysis
          <span className="mode-live-badge" style={{ marginLeft: 6 }}>UP TO 5</span>
        </span>
        {files.length > 0 && (
          <button className="btn-clear" onClick={() => { setFiles([]); setBatchResults(null); }}>
            <RefreshCw size={12} /> Clear
          </button>
        )}
      </div>

      {/* File picker */}
      <div
        className={`dropzone ${files.length > 0 ? 'has-image' : ''}`}
        style={{ padding: files.length > 0 ? '16px' : '32px 20px' }}
        onClick={() => inputRef.current?.click()}
        id="batch-dropzone"
      >
        <input
          ref={inputRef}
          id="batch-file-input"
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
        {files.length > 0 ? (
          <div className="batch-file-list">
            {files.map((f, i) => (
              <div key={i} className="batch-file-item">
                <UploadCloud size={12} color="var(--cyan)" />
                <span>{f.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="dropzone-icon"><UploadCloud size={22} color="#6366f1" /></div>
            <p className="dropzone-title">Select up to 5 images</p>
            <p className="dropzone-sub">All images analyzed in parallel via /api/v1/analyze-batch</p>
            <span className="btn-browse">Choose Files</span>
          </>
        )}
      </div>

      <button
        id="btn-run-batch"
        className="btn-run"
        disabled={running || files.length === 0}
        onClick={runBatch}
        style={{ marginTop: 12 }}
      >
        {running
          ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> {progress}</>
          : <><Zap size={15} /> Analyze Batch ({files.length}/5)</>}
      </button>
    </div>
  );
}
