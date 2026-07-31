import React from 'react';
import { UploadCloud, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UploadCard() {
  const {
    file, preview, analyzing, error,
    onDrop, onFileSelect, runAnalysis, clearAll, fileInputRef,
  } = useApp();

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <UploadCloud size={15} className="card-title-icon" /> Upload Image
        </span>
        {(file || preview) && (
          <button className="btn-clear" onClick={clearAll}>
            <RefreshCw size={12} /> Clear
          </button>
        )}
      </div>

      {/* Drop zone */}
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
              <UploadCloud size={24} color="#6366f1" />
            </div>
            <p className="dropzone-title">Drop image here, or browse</p>
            <p className="dropzone-sub">PNG, JPG, WEBP, GIF — up to 25 MB</p>
            <span className="btn-browse">Choose File</span>
          </>
        )}
      </div>

      {/* Run button */}
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
    </div>
  );
}
