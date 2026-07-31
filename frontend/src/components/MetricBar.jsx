import React from 'react';

/**
 * Reusable metric score bar with label, value, and color.
 * Props:
 *   label  - display name
 *   value  - number in [0, 1]
 *   color  - CSS color string
 *   invert - if true, high value = good (green direction)
 */
export default function MetricBar({ label, value, color, _invert = false }) {
  const displayVal = typeof value === 'number' ? value.toFixed(3) : value;
  const pct        = Math.round((typeof value === 'number' ? value : 0) * 100);

  return (
    <div className="metric-bar-item">
      <div className="metric-bar-header">
        <span className="metric-bar-label">{label}</span>
        <span className="metric-bar-value" style={{ color }}>{displayVal}</span>
      </div>
      <div className="metric-bar-track">
        <div
          className="metric-bar-fill"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
}
