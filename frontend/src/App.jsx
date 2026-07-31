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
import BatchUpload      from './components/BatchUpload';
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
    <div className="card empty-state" style={{ minHeight: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Eye size={26} color="var(--cream)" />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Ready for Verification</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 13.5, maxWidth: 360, lineHeight: 1.6 }}>
        Upload an image or click a preset sample to start authenticity analysis with Grad-CAM++ visual proof and DCT frequency artifact detection.
      </p>
    </div>
  );
}

// ── Detector Tab ───────────────────────────────────────────────────────────────
function DetectorTab() {
  const { analyzing, result, progress } = useApp();

  return (
    <div className="container page-content" style={{ padding: '32px 0 60px' }}>
      <HeroSection />
      <ModeTabs />

      <div className="grid-12">
        {/* Left column */}
        <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <UploadCard />
          <PresetGallery />
          <BatchUpload />
          <BatchResults />
          <AnalysisHistory />
        </div>

        {/* Right column */}
        <div className="col-7">
          {analyzing ? (
            <AnalyzingState progress={progress} />
          ) : result ? (
            <ResultsPanel />
          ) : (
            <EmptyState />
          )}
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
