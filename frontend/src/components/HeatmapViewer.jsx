import React, { useState } from 'react';
import { Eye, SlidersHorizontal, Split } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HeatmapViewer() {
  const { result, preview, viewMode, setViewMode, opacity, setOpacity } = useApp();
  const [sliderPos, setSliderPos] = useState(50); // 0..100 %

  const views = [['blended', 'Overlay'], ['compare', 'Compare'], ['heatmap', 'Heatmap'], ['original', 'Original']];

  const imgSrc = {
    original: result?.original_b64 || preview,
    heatmap:  result?.heatmap_b64  || preview,
    blended:  result?.blended_b64  || preview,
  };

  return (
    <>
      {/* Header */}
      <div className="heatmap-header">
        <div className="heatmap-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>
          <Eye size={14} color="var(--teal)" /> Grad-CAM++ Thermal Activation Map
        </div>
        <div className="view-switcher" role="group" aria-label="Heatmap view mode">
          {views.map(([v, l]) => (
            <button
              key={v}
              id={`view-btn-${v}`}
              className={`view-btn ${viewMode === v ? 'active' : ''}`}
              onClick={() => setViewMode(v)}
            >
              {v === 'compare' && <Split size={11} style={{ marginRight: 3 }} />}
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport */}
      <div className="heatmap-viewport" id="heatmap-viewport" style={{ position: 'relative', overflow: 'hidden', minHeight: 280, borderRadius: 10, border: '1px solid rgba(47,77,70,0.15)', background: '#1c2420' }}>
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
        {viewMode === 'compare' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
            {/* Original underlying image */}
            <img src={imgSrc.original} alt="Original base" className="heatmap-img" style={{ position: 'absolute' }} />
            {/* Heatmap overlay image clipped by slider position */}
            <div style={{ position: 'absolute', inset: 0, clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imgSrc.blended} alt="Blended thermal overlay" className="heatmap-img" />
            </div>
            {/* Vertical slider divider bar */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: 2, background: 'var(--teal)', boxShadow: '0 0 10px rgba(79,174,138,0.8)', zIndex: 10 }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, borderRadius: '50%', background: 'var(--forest)', border: '2px solid var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)', fontSize: 10 }}>
                ↔
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slider Controls */}
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

      {viewMode === 'compare' && (
        <div className="opacity-row">
          <Split size={14} color="var(--teal)" />
          <span className="opacity-label">Curtain Splitter</span>
          <input
            id="compare-slider"
            type="range"
            min={0} max={100}
            value={sliderPos}
            onChange={e => setSliderPos(+e.target.value)}
            className="opacity-slider"
            aria-label="Compare curtain slider"
          />
          <span className="opacity-val">{sliderPos}%</span>
        </div>
      )}

      {/* Dominant region badge */}
      {result?.frequency_analysis && (
        <div className="freq-region-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(47,77,70,0.06)', borderRadius: 8, marginTop: 10 }}>
          <span className="freq-badge-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
            Peak Activation Intensity
          </span>
          <span className="freq-badge-val" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: result.frequency_analysis.freq_ai_score > 0.42 ? 'var(--rose)' : 'var(--emerald)' }}>
            {result.frequency_analysis.freq_ai_score > 0.42 ? '⚠️ High AI Spectral Artifact' : '✓ Organic Frequency Profile'}{' '}
            ({Math.round(result.frequency_analysis.freq_ai_score * 100)}%)
          </span>
        </div>
      )}
    </>
  );
}
