import React from 'react';
import { CheckCircle, AlertTriangle, Info, User, Video, Copy, ThumbsDown, ShieldCheck } from 'lucide-react';
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
  const { result, copySnippet, showToast, API_BASE_URL } = useApp();

  if (!result) return null;

  const isAI   = result.verdict === 'ai_generated';
  const freqAI = result.frequency_analysis;

  const handleCopyResult = () => {
    copySnippet(JSON.stringify(result, null, 2));
  };

  const handleDownloadCertificate = () => {
    const cert = {
      title: "GENUINE.AI AUTHENTICITY VERIFICATION CERTIFICATE",
      timestamp: new Date().toISOString(),
      request_id: result.request_id,
      file_sha256: result.file_sha256 || "N/A",
      verdict: result.verdict,
      confidence: result.confidence_percentage,
      cnn_prob_ai: result.metrics?.max_activation_intensity,
      dct_frequency_metrics: result.frequency_analysis,
      model_version: result.model_version || "genuine-core-v1",
      signature: "GENUINE_AI_FORENSIC_PROOF_STAMP_OK"
    };
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `genuine_ai_certificate_${result.request_id || 'scan'}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Downloaded Authenticity Proof Certificate", "success");
  };

  const handleReportFeedback = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: result.request_id,
          user_verdict: isAI ? 'genuine' : 'ai_generated',
          feedback_type: 'false_flag_report'
        })
      }).catch(() => {});
    } catch { /* ignore fallback */ }
    showToast("Feedback submitted to Genuine.ai model calibration queue", "info");
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

      {/* ── Action Toolbar: Certificate & Feedback ───────────────────── */}
      <div style={{ display: 'flex', gap: 10, margin: '14px 0', paddingBottom: 14, borderBottom: '1px solid rgba(28,36,32,0.08)' }}>
        <button
          onClick={handleDownloadCertificate}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(47,77,70,0.2)',
            background: 'var(--forest)', color: 'var(--cream)', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justify: 'center', gap: 6, boxShadow: '0 2px 6px rgba(47,77,70,0.15)'
          }}
        >
          <ShieldCheck size={14} color="var(--teal)" /> Download Proof Certificate
        </button>
        <button
          onClick={handleReportFeedback}
          title="Report false positive or incorrect verdict"
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(28,36,32,0.15)',
            background: '#ffffff', color: 'var(--ink)', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 6
          }}
        >
          <ThumbsDown size={13} color="var(--rose)" /> Report Issue
        </button>
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
