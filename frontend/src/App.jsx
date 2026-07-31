/**
 * Genuine.ai — Root Application Shell
 * Design system updated from genuine_ai_landing.html:
 * Archivo + Inter + IBM Plex Mono fonts, Warm Cream (#f3ede0) canvas,
 * Deep Forest (#2f4d46) and Ink (#1c2420) structural containers.
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Layout & Navigation
import Navbar           from './components/Navbar';
import HeroSection      from './components/HeroSection';
import ModeTabs         from './components/ModeTabs';

// Detector tab
import UploadCard       from './components/UploadCard';
import PresetGallery    from './components/PresetGallery';
import ResultsPanel     from './components/ResultsPanel';
import AnalyzingState   from './components/AnalyzingState';
import BatchResults     from './components/BatchResults';
import AnalysisHistory  from './components/AnalysisHistory';

// Other tabs
import ApiTab           from './components/ApiTab';
import DocsTab          from './components/DocsTab';

// Global overlays
import ToastNotification from './components/ToastNotification';
import AboutModal        from './components/AboutModal';

// ── Empty state placeholder ────────────────────────────────────────────────────
import { Eye } from 'lucide-react';
function EmptyState() {
  return (
    <div className="card empty-state" style={{ minHeight: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 20px rgba(47,77,70,0.25)' }}>
        <Eye size={26} color="var(--cream)" />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Ready for Verification</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, maxWidth: 380, lineHeight: 1.6 }}>
        Upload an image or select a test sample to initiate real-time authenticity verification with Grad-CAM++ thermal proof and DCT frequency signature analysis.
      </p>
    </div>
  );
}

// ── Detector Tab ───────────────────────────────────────────────────────────────
function DetectorTab() {
  const { analyzing, result, progress } = useApp();

  return (
    <div className="container page-content" style={{ padding: '24px 0 60px' }}>
      <HeroSection />
      <ModeTabs />

      <div className="grid-12" style={{ alignItems: 'start' }}>
        {/* Left column — Upload controls & Presets */}
        <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <UploadCard />
          <PresetGallery />
          <AnalysisHistory />
        </div>

        {/* Right column — Sticky Verification Panel & Heatmap */}
        <div className="col-7" style={{ position: 'sticky', top: '88px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {analyzing ? (
            <AnalyzingState progress={progress} />
          ) : result ? (
            <ResultsPanel />
          ) : (
            <EmptyState />
          )}
          <BatchResults />
        </div>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
function AppShell() {
  const { tab, toast } = useApp();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      {tab === 'detector' && <DetectorTab />}
      {tab === 'api'      && <ApiTab />}
      {tab === 'docs'     && <DocsTab />}

      {/* Footer from genuine_ai_landing.html */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <span className="footer-brand-name">GENUINE<span>.AI</span></span>
            <span className="footer-tagline">— PIXEL-LEVEL PROOF</span>
          </div>
          <p className="footer-right">
            CIFAKE CNN + GRAD-CAM++ + DCT · IEEE ACCESS 2024 · FASTAPI v1.1
          </p>
        </div>
      </footer>

      {/* Global overlays */}
      <ToastNotification toast={toast} />
      <AboutModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
