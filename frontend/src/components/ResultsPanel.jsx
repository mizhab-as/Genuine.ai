import React from 'react';
import { CheckCircle, AlertTriangle, Info, User, Video, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import HeatmapViewer from './HeatmapViewer';
import MetricBar from './MetricBar';

const METRIC_COLORS = {
  frequency_artifact_score:     '#22d3ee',
  edge_anomaly_index:           '#a855f7',
  background_noise_consistency: '#10b981',
  max_activation_intensity:     '#f59e0b',
};
const METRIC_LABELS = {
  frequency_artifact_score:     'Artifact Index',
  edge_anomaly_index:           'Edge Anomaly',
  background_noise_consistency: 'Noise Score',
  max_activation_intensity:     'Peak Activation',
};
const FREQ_COLORS = {
  grid_artifact_score:     '#f43f5e',
  freq_ai_score:           '#f59e0b',
  spectral_entropy:        '#10b981',
  local_std_uniformity:    '#a855f7',
};
const FREQ_LABELS = {
  grid_artifact_score:  'Grid Artifact Score',
  freq_ai_score:        'Freq. AI Score',
  spectral_entropy:     'Spectral Entropy',
  local_std_uniformity: 'Noise Uniformity',
};

export default function ResultsPanel() {
  const { result, copySnippet } = useApp();

  if (!result) return null;

  const isAI   = result.verdict === 'ai_generated';
  const freqAI = result.frequency_analysis;

  const handleCopyResult = () => {
    copySnippet(JSON.stringify({
      verdict:    result.verdict,
      confidence: result.confidence,
      request_id: result.request_id,
    }, null, 2));
  };

  return (
    <div className="card animate-in" style={{ minHeight: 440 }}>

      {/* ── Verdict Row ─────────────────────────────────────────────── */}
      <div className="verdict-row">
        <div>
          <p className="verdict-label-tiny">Forensic Verdict</p>
          <div className={`verdict-badge ${isAI ? 'ai-generated' : 'genuine'}`}>
            {isAI ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            {isAI ? 'AI-Generated Content' : 'Authentic — Genuine Image'}
          </div>
          {result.request_id && (
            <p className="req-id-label">
              req: {result.request_id}
              <button className="btn-copy-inline" onClick={handleCopyResult} title="Copy result JSON">
                <Copy size={10} />
              </button>
            </p>
          )}
        </div>
        <div className="confidence-box">
          <div className="confidence-header">
            <span className="confidence-label-sm">Model Confidence</span>
            <span className={`confidence-value-sm ${result.verdict}`}>
              {result.confidence_percentage}
            </span>
          </div>
          <div className="confidence-bar-bg">
            <div
              className={`confidence-bar-fill ${result.verdict}`}
              style={{ width: result.confidence_percentage }}
            />
          </div>
          {result.cnn_weight !== undefined && (
            <div className="fusion-weights">
              <span>CNN {Math.round(result.cnn_weight * 100)}%</span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span>DCT {Math.round(result.freq_weight * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Mode-specific info ──────────────────────────────────────── */}
      {result.mode === 'face_check' && (
        <div className="face-pill">
          <span className="face-pill-left"><User size={14} /> MTCNN Face Region Detected & Analyzed</span>
          <span className="face-pill-right">Box {JSON.stringify(result.face_bounding_box)}</span>
        </div>
      )}

      {result.mode === 'video_check' && result.frames_timeline && (
        <div className="video-timeline">
          <div className="video-timeline-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Video size={13} /> Temporal Frame Analysis</span>
            <span>{result.frames_analyzed} frames</span>
          </div>
          <div className="frames-grid">
            {result.frames_timeline.map(f => (
              <div key={f.frame} className="frame-tile">
                <p className="frame-ts">{f.timestamp}</p>
                <p className="frame-score" style={{ color: f.status === 'genuine' ? 'var(--emerald)' : 'var(--rose)' }}>
                  {Math.round(f.score * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Heatmap Viewer ──────────────────────────────────────────── */}
      <HeatmapViewer />

      {/* ── Explanation ─────────────────────────────────────────────── */}
      <div className="explanation-card">
        <div className="explanation-label"><Info size={12} /> Forensic Decision Rationale</div>
        <p className="explanation-text">{result.explanation}</p>
      </div>

      {/* ── CNN Metrics ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 20 }}>
        <p className="section-label">CNN Detection Metrics</p>
        <div className="metrics-grid">
          {Object.entries(result.metrics || {}).map(([k, v]) => (
            <MetricBar
              key={k}
              label={METRIC_LABELS[k] || k}
              value={v}
              color={METRIC_COLORS[k] || '#94a3b8'}
            />
          ))}
        </div>
      </div>

      {/* ── Frequency Analysis Metrics ──────────────────────────────── */}
      {freqAI && (
        <div style={{ marginTop: 20 }}>
          <p className="section-label">DCT Frequency Analysis</p>
          <div className="metrics-grid">
            {['grid_artifact_score', 'freq_ai_score', 'spectral_entropy', 'local_std_uniformity'].map(k => (
              <MetricBar
                key={k}
                label={FREQ_LABELS[k]}
                value={freqAI[k]}
                color={FREQ_COLORS[k] || '#94a3b8'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
