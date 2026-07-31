/**
 * Genuine.ai — Root Application Shell
 * Thin orchestrator: imports components, wires up layout, renders tabs.
 * All state lives in AppContext. All logic lives in useAnalysis.
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
    <div className="card empty-state" style={{ minHeight: 440 }}>
      <div className="empty-icon"><Eye size={28} color="#6366f1" /></div>
      <p className="empty-title">Ready for Verification</p>
      <p className="empty-sub">
        Upload an image or click a preset sample to start authenticity analysis
        with Grad-CAM++ visual proof and DCT frequency signature detection.
      </p>
    </div>
  );
}

// ── Detector Tab ───────────────────────────────────────────────────────────────
function DetectorTab() {
  const { analyzing, result, progress } = useApp();

  return (
    <div className="container page-content">
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

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-brand-name">Genuine<span>.ai</span></span>
            <span className="footer-tagline">— Know what's real.</span>
          </div>
          <p className="footer-right">
            CIFAKE CNN + Grad-CAM++ + DCT Analysis · Bird & Lotfi, IEEE Access 2024 · FastAPI v1.1 · PyTorch 2
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
