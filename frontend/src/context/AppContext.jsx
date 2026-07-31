/**
 * AppContext — Global state & analysis logic for Genuine.ai
 * Provides: analysisHistory, apiOnline, activeMode, currentResult, useAnalysis hook
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MODES, PRESETS, FALLBACK_RESULT } from './constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tab,             setTab]           = useState('detector');
  const [mode,            setMode]          = useState('general');
  const [file,            setFile]          = useState(null);
  const [preview,         setPreview]       = useState(null);
  const [analyzing,       setAnalyzing]     = useState(false);
  const [progress,        setProgress]      = useState('');
  const [result,          setResult]        = useState(null);
  const [error,           setError]         = useState(null);
  const [viewMode,        setViewMode]      = useState('blended');
  const [opacity,         setOpacity]       = useState(60);
  const [apiOnline,       setApiOnline]     = useState(false);
  const [history,         setHistory]       = useState([]);
  const [toast,           setToast]         = useState(null);
  const [batchResults,    setBatchResults]  = useState(null);
  const [aboutOpen,       setAboutOpen]     = useState(false);
  const [compareMode,     setCompareMode]   = useState(false);
  const [copied,          setCopied]        = useState(false);
  const fileInputRef = useRef(null);

  // ── API health poll ────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () =>
      fetch(`${API_BASE_URL}/api/v1/health`)
        .then(r => r.json())
        .then(d => setApiOnline(d.status === 'healthy'))
        .catch(() => setApiOnline(false));
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setFile(null); setPreview(null); setResult(null); setError(null); setBatchResults(null);
  }, []);

  // ── File select ───────────────────────────────────────────────────────────
  const onFileSelect = useCallback(f => {
    if (!f) return;
    setError(null); setResult(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  }, [onFileSelect]);

  // ── Copy snippet ──────────────────────────────────────────────────────────
  const copySnippet = useCallback(text => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  }, [showToast]);

  // ── Run Analysis ──────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async (overrideFile = null, presetId = null) => {
    const target = overrideFile || file;
    if (!target && !preview) { setError('Please upload or select an image first.'); return; }

    setAnalyzing(true); setError(null); setResult(null);
    const steps = [
      'Extracting RGB tensor (64×64 normalised)…',
      'Running Conv2D → BatchNorm → ReLU pipeline…',
      'Computing DCT frequency artifact spectrum…',
      'Generating Grad-CAM++ spatial activation map…',
      'Fusing CNN + frequency signals…',
    ];
    let stepIdx = 0;
    setProgress(steps[0]);
    const progressInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setProgress(steps[stepIdx]);
    }, 380);

    const modeConfig = MODES.find(m => m.id === mode);

    try {
      const fd = new FormData();
      fd.append('file', target);
      if (presetId) fd.append('preset_id', presetId);

      const res = await fetch(`${API_BASE_URL}${modeConfig.endpoint}`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      setApiOnline(true);

      // Add to history
      setHistory(prev => [{
        id:         data.request_id || Date.now(),
        verdict:    data.verdict,
        confidence: data.confidence,
        mode,
        preview:    overrideFile ? URL.createObjectURL(overrideFile) : preview,
        filename:   target?.name || presetId || 'unknown',
        timestamp:  new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 19)]);

      showToast(`Analysis complete — ${data.verdict === 'ai_generated' ? '⚠️ AI Generated' : '✅ Genuine'}`, data.verdict === 'ai_generated' ? 'warning' : 'success');
    } catch {
      // Graceful fallback demo
      setTimeout(() => {
        const fallback = FALLBACK_RESULT(presetId, preview);
        setResult(fallback);
        setHistory(prev => [{
          id:         Date.now(),
          verdict:    fallback.verdict,
          confidence: fallback.confidence,
          mode,
          preview,
          filename:   target?.name || presetId || 'unknown',
          timestamp:  new Date().toLocaleTimeString(),
        }, ...prev.slice(0, 19)]);
        showToast('API offline — showing demo result', 'warning');
      }, 900);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setAnalyzing(false), 800);
    }
  }, [file, preview, mode, showToast]);

  // ── Load Preset ───────────────────────────────────────────────────────────
  const loadPreset = useCallback(async preset => {
    setError(null); setPreview(preset.url); setFile(null); setResult(null);
    setAnalyzing(true); setProgress('Loading preset image matrix…');
    try {
      const blob = await (await fetch(preset.url)).blob();
      const f    = new File([blob], `${preset.id}.jpg`, { type: 'image/jpeg' });
      setFile(f);
      await runAnalysis(f, preset.id);
    } catch { /* runAnalysis fallback handles it */ }
  }, [runAnalysis]);

  const value = {
    // State
    tab, setTab, mode, setMode, file, setFile, preview, setPreview,
    analyzing, progress, result, setResult, error, setError,
    viewMode, setViewMode, opacity, setOpacity,
    apiOnline, history, toast, batchResults, setBatchResults,
    aboutOpen, setAboutOpen, compareMode, setCompareMode, copied,
    fileInputRef,
    // Actions
    clearAll, onFileSelect, onDrop, runAnalysis, loadPreset, copySnippet, showToast,
    // Constants
    API_BASE_URL, MODES, PRESETS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
