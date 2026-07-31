import React from 'react';

/**
 * Toast notification system.
 * Types: 'success' | 'warning' | 'error' | 'info'
 */
export default function ToastNotification({ toast }) {
  if (!toast) return null;

  const icons = {
    success: '✅',
    warning: '⚠️',
    error:   '❌',
    info:    'ℹ️',
  };

  const colors = {
    success: 'var(--emerald)',
    warning: 'var(--amber)',
    error:   'var(--rose)',
    info:    'var(--cyan)',
  };

  return (
    <div
      className="toast-container"
      id={`toast-${toast.id}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast" style={{ borderLeftColor: colors[toast.type] || colors.info }}>
        <span className="toast-icon">{icons[toast.type] || icons.info}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  );
}
