import React from 'react';
import { ShieldCheck, X, Github, Cpu, Zap, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutModal() {
  const { aboutOpen, setAboutOpen } = useApp();
  if (!aboutOpen) return null;

  return (
    <div
      className="modal-backdrop"
      id="about-modal-backdrop"
      onClick={e => e.target === e.currentTarget && setAboutOpen(false)}
    >
      <div className="modal-panel" role="dialog" aria-labelledby="about-modal-title">
        <div className="modal-header">
          <div className="brand" style={{ cursor: 'default' }}>
            <div className="brand-icon"><ShieldCheck size={16} color="#fff" /></div>
            <span className="brand-name">Genuine<span>.ai</span></span>
            <span className="badge-pill">v1.1.0</span>
          </div>
          <button id="close-about-modal" className="btn-clear" onClick={() => setAboutOpen(false)}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            Genuine.ai is an AI-generated content detection platform based on the{' '}
            <strong style={{ color: 'var(--text-primary)' }}>CIFAKE paper</strong>{' '}
            (Bird & Lotfi, IEEE Access, 2024). It fuses CNN classification with DCT
            frequency analysis and Grad-CAM++ explainability.
          </p>

          <div className="modal-tech-grid">
            <div className="modal-tech-item">
              <Cpu size={16} color="var(--cyan)" />
              <div>
                <p className="modal-tech-label">Detection Engine</p>
                <p className="modal-tech-val">CIFAKE CNN + Temperature Scaling</p>
              </div>
            </div>
            <div className="modal-tech-item">
              <Zap size={16} color="var(--amber)" />
              <div>
                <p className="modal-tech-label">Frequency Analysis</p>
                <p className="modal-tech-val">DCT / FFT Spectral Artifact Detection</p>
              </div>
            </div>
            <div className="modal-tech-item">
              <BarChart2 size={16} color="var(--purple)" />
              <div>
                <p className="modal-tech-label">Explainability</p>
                <p className="modal-tech-val">Grad-CAM++ Spatial Activation Maps</p>
              </div>
            </div>
          </div>

          <div className="modal-stack-row">
            {['FastAPI', 'PyTorch 2', 'React 19', 'Vite 8', 'OpenCV', 'SciPy DCT'].map(t => (
              <span key={t} className="stack-badge">{t}</span>
            ))}
          </div>

          <div className="modal-footer-links">
            <a
              href="https://github.com/mizhab-as/Genuine.ai"
              target="_blank"
              rel="noreferrer"
              className="modal-link"
            >
              <Github size={14} /> View on GitHub
            </a>
            <a
              href="https://ieeexplore.ieee.org/document/10409290"
              target="_blank"
              rel="noreferrer"
              className="modal-link"
            >
              📄 CIFAKE Paper (IEEE)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
