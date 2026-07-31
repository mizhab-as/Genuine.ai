import React from 'react';
import { Eye, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HeatmapViewer() {
  const { result, preview, viewMode, setViewMode, opacity, setOpacity } = useApp();

  const views = [['blended', 'Overlay'], ['heatmap', 'Heatmap'], ['original', 'Original']];

  const imgSrc = {
    original: result?.original_b64 || preview,
    heatmap:  result?.heatmap_b64  || preview,
    blended:  result?.blended_b64  || preview,
  };

  return (
    <>
      {/* Header */}
      <div className="heatmap-header">
        <div className="heatmap-title">
          <Eye size={14} color="#22d3ee" /> Grad-CAM++ Heatmap
        </div>
        <div className="view-switcher" role="group" aria-label="Heatmap view mode">
          {views.map(([v, l]) => (
            <button
              key={v}
              id={`view-btn-${v}`}
              className={`view-btn ${viewMode === v ? 'active' : ''}`}
              onClick={() => setViewMode(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport */}
      <div className="heatmap-viewport" id="heatmap-viewport">
        {viewMode === 'original' && (
          <img src={imgSrc.original} alt="Original image" className="heatmap-img" />
        )}
        {viewMode === 'heatmap' && (
          <img
            src={imgSrc.heatmap}
            alt="Grad-CAM heatmap"
            className="heatmap-img"
            style={{ filter: 'saturate(1.4)' }}
          />
        )}
        {viewMode === 'blended' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={result?.face_crop_b64 || imgSrc.original}
              alt="Base"
              className="heatmap-img"
              style={{ position: 'absolute' }}
            />
            <img
              src={imgSrc.heatmap}
              alt="Heatmap overlay"
              className="heatmap-img"
              style={{ position: 'absolute', opacity: opacity / 100, mixBlendMode: 'screen', transition: 'opacity 0.15s' }}
            />
          </div>
        )}
      </div>

      {/* Opacity slider (blended only) */}
      {viewMode === 'blended' && (
        <div className="opacity-row">
          <SlidersHorizontal size={14} color="var(--text-muted)" />
          <span className="opacity-label">Heatmap Opacity</span>
          <input
            id="opacity-slider"
            type="range"
            min={0} max={100}
            value={opacity}
            onChange={e => setOpacity(+e.target.value)}
            className="opacity-slider"
            aria-label="Heatmap opacity"
          />
          <span className="opacity-val">{opacity}%</span>
        </div>
      )}

      {/* Dominant region badge */}
      {result?.frequency_analysis && (
        <div className="freq-region-badge">
          <span className="freq-badge-label">Peak Activation Region</span>
          <span className="freq-badge-val">
            {result.frequency_analysis.grid_artifact_score > 0.4 ? '⚠️' : '✓'}{' '}
            freq score: {Math.round(result.frequency_analysis.freq_ai_score * 100)}%
          </span>
        </div>
      )}
    </>
  );
}
