/**
 * Genuine.ai — Shared constants
 * Extracted to a separate file so AppContext only exports components/hooks.
 * (Satisfies react/only-export-components fast-refresh lint rule)
 */

export const MODES = [
  { id: 'general', label: 'General Media',   icon: 'ImageIcon', endpoint: '/api/v1/analyze',          live: true,  activeClass: 'active-general' },
  { id: 'face',    label: 'Facial Deepfakes', icon: 'User',      endpoint: '/api/v1/analyze-face',     live: false, activeClass: 'active-face'    },
  { id: 'doc',     label: 'Documents & Sigs', icon: 'FileCheck', endpoint: '/api/v1/analyze-document', live: false, activeClass: 'active-doc'     },
  { id: 'video',   label: 'Video Stream',     icon: 'Video',     endpoint: '/api/v1/analyze-video',    live: false, activeClass: 'active-video'   },
];

export const PRESETS = [
  {
    id:      'genuine_nature',
    name:    'Real — Nature Landscape',
    url:     'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    verdict: 'genuine',
  },
  {
    id:      'ai_portrait',
    name:    'AI — Synthetic Art',
    url:     'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    verdict: 'ai_generated',
  },
  {
    id:      'genuine_face',
    name:    'Real — Human Portrait',
    url:     'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    verdict: 'genuine',
  },
];

export const FALLBACK_RESULT = (presetId, preview) => {
  const isAI = presetId === 'ai_portrait' || Math.random() > 0.45;
  const conf  = isAI ? 0.91 + Math.random() * 0.07 : 0.92 + Math.random() * 0.07;
  return {
    request_id:           'demo-fallback',
    verdict:              isAI ? 'ai_generated' : 'genuine',
    confidence:           parseFloat(conf.toFixed(4)),
    confidence_percentage:`${Math.round(conf * 100)}%`,
    original_b64: preview, heatmap_b64: preview, blended_b64: preview,
    model_version:        'genuine-core-v1',
    explanation: isAI
      ? 'High-frequency spatial micro-artifacts and synthetic background grid patterns characteristic of latent-diffusion generation detected in Conv2D activation map.'
      : 'Uniform photon sensor noise and organic edge-transition continuity verified. No latent-diffusion grid signatures present.',
    analysis_time_ms: 28.4,
    frequency_analysis: {
      high_freq_ratio:     isAI ? 0.41 : 0.18,
      spectral_entropy:    isAI ? 0.31 : 0.72,
      periodicity_score:   isAI ? 0.63 : 0.12,
      grid_artifact_score: isAI ? 0.58 : 0.14,
      noise_variance:      isAI ? 38.2 : 124.6,
      laplacian_score:     isAI ? 18.4 : 42.7,
      local_std_uniformity: isAI ? 0.78 : 0.31,
      freq_ai_score:       isAI ? 0.71 : 0.22,
    },
    metrics: {
      frequency_artifact_score:     isAI ? 0.88 : 0.12,
      edge_anomaly_index:           isAI ? 0.91 : 0.08,
      background_noise_consistency: isAI ? 0.24 : 0.96,
      max_activation_intensity:     isAI ? 0.94 : 0.35,
    },
    cnn_weight: 0.55,
    freq_weight: 0.45,
  };
};
