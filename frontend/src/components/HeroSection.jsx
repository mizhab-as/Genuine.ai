import React from 'react';
import { Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="hero">
      <div className="hero-eyebrow">
        <Sparkles size={12} /> AI-Generated Content Detection — Explainable Deep Learning
      </div>
      <h1 className="hero-h1">
        Verify Image Authenticity<br />
        with <span className="highlight">Pixel-Level Proof</span>
      </h1>
      <p className="hero-sub">
        Genuine.ai fuses a <em>CIFAKE CNN classifier</em> with <em>DCT frequency analysis</em> and{' '}
        <em>Grad-CAM++ thermal heatmaps</em> to reveal exactly which regions signal AI generation —
        not just a number, but <em>visual evidence</em>.
      </p>
    </div>
  );
}
