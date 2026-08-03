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

// Detector components
import UploadCard       from './components/UploadCard';
import PresetGallery    from './components/PresetGallery';
import ResultsPanel     from './components/ResultsPanel';
import AnalyzingState   from './components/AnalyzingState';
import BatchResults     from './components/BatchResults';
import AnalysisHistory  from './components/AnalysisHistory';

// Global overlays & drawer
import DeveloperDrawer  from './components/DeveloperDrawer';
import ToastNotification from './components/ToastNotification';
import AboutModal        from './components/AboutModal';

// ── Empty state placeholder ────────────────────────────────────────────────────
import { Eye } from 'lucide-react';
function EmptyState() {
  return (
    <div className="card empty-state" style={{ minHeight: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 20px rgba(47,77,70,0.25)' }}>
        <Eye size={24} color="var(--cream)" />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Ready for Verification</p>
      <p style={{ color: 'var(--text-dim)', fontSize: 13.5, maxWidth: 380, lineHeight: 1.6 }}>
        Upload an image or select a test sample to initiate real-time authenticity verification with Grad-CAM++ thermal proof and off-axis FFT/DCT frequency analysis.
      </p>
    </div>
  );
}

// ── Detector Studio ────────────────────────────────────────────────────────────
function DetectorTab() {
  const { analyzing, result, progress } = useApp();

  return (
    <div className="container page-content" style={{ padding: '16px 0 48px' }}>
      <HeroSection />

      <div className="grid-12" style={{ alignItems: 'start', marginTop: 16 }}>
        {/* Left column — Upload controls, Presets & History */}
        <div className="col-5" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <UploadCard />
          <PresetGallery />
          <AnalysisHistory />
        </div>

        {/* Right column — Sticky Verification Panel & Heatmap */}
        <div className="col-7" style={{ position: 'sticky', top: '80px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
  const { toast } = useApp();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      <DetectorTab />

      {/* Footer */}
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
      <DeveloperDrawer />
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
