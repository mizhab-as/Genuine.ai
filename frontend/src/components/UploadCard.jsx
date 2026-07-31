import React, { useRef, useState } from 'react';
import { UploadCloud, RefreshCw, Zap, AlertTriangle, Layers, FileImage } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UploadCard() {
  const {
    file, preview, analyzing, error,
    onDrop, onFileSelect, runAnalysis, clearAll, fileInputRef,
    API_BASE_URL, showToast, setBatchResults,
  } = useApp();

  const [scanMode, setScanMode] = useState('single'); // 'single' | 'batch'
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');
  const batchInputRef = useRef(null);

  const handleBatchFiles = e => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setBatchFiles(selected);
    setBatchResults(null);
  };

  const runBatch = async () => {
    if (batchFiles.length === 0) return;
    setBatchRunning(true);
    setBatchProgress(`Analyzing ${batchFiles.length} images in parallel…`);

    try {
      const fd = new FormData();
      batchFiles.forEach(f => fd.append('files', f));
      const res = await fetch(`${API_BASE_URL}/api/v1/analyze-batch`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBatchResults(data);
      showToast(`Batch complete: ${data.ai_count} AI, ${data.genuine_count} real`, 'success');
    } catch {
      // Demo fallback
      const fakeResults = batchFiles.map((f, i) => {
        const isAI = Math.random() > 0.5;
        return {
          filename: f.name,
          index: i,
          verdict: isAI ? 'ai_generated' : 'genuine',
          confidence: parseFloat((0.80 + Math.random() * 0.18).toFixed(4)),
          confidence_percentage: `${Math.round((0.80 + Math.random() * 0.18) * 100)}%`,
          freq_ai_score: parseFloat((Math.random()).toFixed(4)),
          grid_artifact_score: parseFloat((Math.random()).toFixed(4)),
          analysis_time_ms: parseFloat((15 + Math.random() * 40).toFixed(1)),
        };
      });
      const aiCount = fakeResults.filter(r => r.verdict === 'ai_generated').length;
      const genCount = fakeResults.filter(r => r.verdict === 'genuine').length;
      setBatchResults({
        total_files: batchFiles.length,
        processed: batchFiles.length,
        errors: 0,
        ai_count: aiCount,
        genuine_count: genCount,
        avg_confidence: parseFloat((fakeResults.reduce((s, r) => s + r.confidence, 0) / fakeResults.length).toFixed(4)),
        results: fakeResults,
        total_time_ms: parseFloat((50 + Math.random() * 100).toFixed(1)),
      });
      showToast('API offline — showing demo batch result', 'warning');
    } finally {
      setBatchRunning(false);
      setBatchProgress('');
    }
  };

  const clearBatch = () => {
    setBatchFiles([]);
    setBatchResults(null);
  };

  return (
    <div className="card">
      {/* Top Segment Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--cream)', padding: 3, borderRadius: 20, border: '1px solid rgba(28,36,32,0.08)' }}>
          <button
            type="button"
            className={`view-btn ${scanMode === 'single' ? 'active' : ''}`}
            onClick={() => setScanMode('single')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FileImage size={13} /> Single Image
          </button>
          <button
            type="button"
            className={`view-btn ${scanMode === 'batch' ? 'active' : ''}`}
            onClick={() => setScanMode('batch')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Layers size={13} /> Batch (Up to 5)
          </button>
        </div>

        {scanMode === 'single' && (file || preview) && (
          <button className="btn-clear" onClick={clearAll}>
            <RefreshCw size={12} /> Clear
          </button>
        )}

        {scanMode === 'batch' && batchFiles.length > 0 && (
          <button className="btn-clear" onClick={clearBatch}>
            <RefreshCw size={12} /> Clear
          </button>
        )}
      </div>

      {/* SINGLE IMAGE MODE */}
      {scanMode === 'single' && (
        <>
          <div
            className={`dropzone ${preview ? 'has-image' : ''}`}
            id="upload-dropzone"
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => e.currentTarget.classList.add('drag-over')}
            onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])}
            />

            {preview ? (
              <>
                <div style={{ position: 'relative' }}>
                  <img src={preview} alt="preview" className="preview-img" />
                  {analyzing && <div className="scan-line" />}
                </div>
                {file && <p className="preview-filename">{file.name}</p>}
              </>
            ) : (
              <>
                <div className="dropzone-icon">
                  <UploadCloud size={24} />
                </div>
                <p className="dropzone-title">Drop image here, or browse</p>
                <p className="dropzone-sub">PNG, JPG, WEBP, GIF — up to 25 MB</p>
                <span className="btn-browse">Choose File</span>
              </>
            )}
          </div>

          <button
            id="btn-run-analysis"
            className="btn-run"
            disabled={analyzing || (!file && !preview)}
            onClick={() => runAnalysis()}
          >
            {analyzing
              ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing…</>
              : <><Zap size={15} /> Run Verification</>}
          </button>

          {error && (
            <div className="error-msg" role="alert">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </>
      )}

      {/* BATCH MODE */}
      {scanMode === 'batch' && (
        <>
          <div
            className={`dropzone ${batchFiles.length > 0 ? 'has-image' : ''}`}
            style={{ padding: batchFiles.length > 0 ? '16px' : '32px 20px' }}
            onClick={() => batchInputRef.current?.click()}
            id="batch-dropzone"
          >
            <input
              ref={batchInputRef}
              id="batch-file-input"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleBatchFiles}
            />
            {batchFiles.length > 0 ? (
              <div className="batch-file-list">
                {batchFiles.map((f, i) => (
                  <div key={i} className="batch-file-item">
                    <UploadCloud size={12} color="var(--teal)" />
                    <span>{f.name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="dropzone-icon"><UploadCloud size={24} /></div>
                <p className="dropzone-title">Select up to 5 images</p>
                <p className="dropzone-sub">All images analyzed in parallel via /api/v1/analyze-batch</p>
                <span className="btn-browse">Choose Files</span>
              </>
            )}
          </div>

          <button
            id="btn-run-batch"
            className="btn-run"
            disabled={batchRunning || batchFiles.length === 0}
            onClick={runBatch}
          >
            {batchRunning
              ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> {batchProgress}</>
              : <><Zap size={15} /> Analyze Batch ({batchFiles.length}/5)</>}
          </button>
        </>
      )}
    </div>
  );
}
