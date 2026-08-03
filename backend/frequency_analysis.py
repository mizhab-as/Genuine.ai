"""
Frequency Analysis Engine for Genuine.ai
=========================================
Real-signal detection using Discrete Cosine Transform (DCT) and Fast Fourier Transform (FFT).

Key Insight (from Bird & Lotfi, CIFAKE IEEE Access 2024):
  AI-generated images produced by latent diffusion models exhibit:
  - Characteristic high-frequency grid artifacts in DCT space
  - Reduced spectral entropy (smoother frequency distribution)
  - Periodic regularity in background texture (from the latent grid)

These signals work WITHOUT trained model weights, giving genuine detection
capability independent of the CNN classifier.
"""

import io
import numpy as np
from PIL import Image

try:
    from scipy.fft import dct, dctn
    from scipy.stats import entropy as scipy_entropy
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False


def _to_grayscale_array(pil_img: Image.Image, size: int = 256) -> np.ndarray:
    """Resize to square and convert to float32 grayscale array."""
    img = pil_img.convert("L").resize((size, size), Image.LANCZOS)
    return np.array(img, dtype=np.float32)


def compute_dct_features(pil_img: Image.Image) -> dict:
    """
    Computes DCT-based frequency features from an image.

    Returns:
        high_freq_ratio    - Ratio of energy in high-frequency DCT coefficients.
        spectral_entropy   - Shannon entropy of the AC DCT coefficient magnitude distribution.
        periodicity_score  - Off-axis high-frequency FFT spectral peak z-score.
        grid_artifact_score- Composite score combining frequency signals [0.0–1.0].
    """
    gray = _to_grayscale_array(pil_img, size=256)

    # ── DCT Analysis ──────────────────────────────────────────────────────────
    if SCIPY_AVAILABLE:
        dct_coeffs = dctn(gray, norm="ortho")
    else:
        # Fallback: manual 2D DCT via numpy FFT
        dct_coeffs = np.fft.fft2(gray).real

    dct_magnitude = np.abs(dct_coeffs)

    # Total energy
    total_energy = np.sum(dct_magnitude ** 2) + 1e-10

    # Split into low / mid / high frequency bands
    h, w = dct_magnitude.shape
    low_cutoff_h, low_cutoff_w = h // 8, w // 8
    mid_cutoff_h, mid_cutoff_w = h // 3, w // 3

    low_energy     = np.sum(dct_magnitude[:low_cutoff_h, :low_cutoff_w] ** 2)
    low_mid_energy = np.sum(dct_magnitude[:mid_cutoff_h, :mid_cutoff_w] ** 2)
    high_energy    = total_energy - low_mid_energy

    high_freq_ratio = float(high_energy / total_energy)

    # ── AC Spectral Entropy ───────────────────────────────────────────────────
    ac_mag = dct_magnitude.copy()
    ac_mag[0, 0] = 0.0  # Exclude DC component
    ac_flat = ac_mag.flatten()
    ac_norm = ac_flat / (np.sum(ac_flat) + 1e-10)

    nonzero_ac = ac_norm[ac_norm > 1e-8]
    if len(nonzero_ac) > 0:
        hist, _ = np.histogram(np.log10(nonzero_ac + 1e-12), bins=32)
        hist_prob = hist / (hist.sum() + 1e-10)
        if SCIPY_AVAILABLE:
            spectral_entropy = float(scipy_entropy(hist_prob + 1e-12))
        else:
            spectral_entropy = float(-np.sum(hist_prob * np.log(hist_prob + 1e-12)))
        # Max theoretical entropy for 32 bins is ln(32) ≈ 3.4657
        spectral_entropy_norm = float(np.clip(spectral_entropy / 3.4657, 0.0, 1.0))
    else:
        spectral_entropy_norm = 0.5

    # ── Off-Axis FFT Periodicity / Grid Analysis ──────────────────────────────
    # Mask DC center (12px) AND cardinal axes (2px) to ignore horizon lines & 1D edges
    fft_mag = np.abs(np.fft.fftshift(np.fft.fft2(gray)))
    cy, cx = h // 2, w // 2
    high_freq_fft = fft_mag.copy()
    high_freq_fft[cy - 12:cy + 12, cx - 12:cx + 12] = 0.0
    high_freq_fft[cy - 2:cy + 2, :] = 0.0
    high_freq_fft[:, cx - 2:cx + 2] = 0.0

    valid_pts = high_freq_fft[high_freq_fft > 0]
    if len(valid_pts) > 10:
        fft_max    = float(np.max(valid_pts))
        fft_median = float(np.median(valid_pts))
        fft_std    = float(np.std(valid_pts)) + 1e-10
        z_peak     = (fft_max - fft_median) / fft_std
        periodicity_score = float(np.clip((z_peak - 10.0) / 25.0, 0.0, 1.0))
    else:
        periodicity_score = 0.0

    # ── Grid Artifact Score (Composite) ───────────────────────────────────────
    grid_artifact_score = float(np.clip(
        0.65 * periodicity_score
        + 0.20 * min(high_freq_ratio / 0.015, 1.0)
        + 0.15 * (1.0 - spectral_entropy_norm),
        0.0, 1.0
    ))

    return {
        "high_freq_ratio":     round(high_freq_ratio, 4),
        "spectral_entropy":    round(spectral_entropy_norm, 4),
        "periodicity_score":   round(periodicity_score, 4),
        "grid_artifact_score": round(grid_artifact_score, 4),
    }


def compute_noise_analysis(pil_img: Image.Image) -> dict:
    """
    Analyzes sensor noise characteristics of an image.

    Real photographs have organic, non-uniform photon noise.
    AI-generated images have smooth, structured noise from the diffusion process.

    Returns:
        noise_variance       - Variance of the high-pass residual (higher → more noise → more real)
        laplacian_score      - Mean absolute Laplacian (edge sharpness signal)
        local_std_uniformity - How uniform local noise is (higher → more AI-like)
    """
    gray = _to_grayscale_array(pil_img, size=128)

    # ── High-pass residual via difference filter ──────────────────────────────
    padded = np.pad(gray, 1, mode="reflect")
    h, w = gray.shape
    residual = gray - (padded[:-2, 1:-1] + padded[2:, 1:-1] + padded[1:-1, :-2] + padded[1:-1, 2:]) / 4.0
    noise_variance = float(np.var(residual))

    # ── Laplacian sharpness ───────────────────────────────────────────────────
    kernel = np.array([[0, -1, 0], [-1, 4, -1], [0, -1, 0]], dtype=np.float32)
    padded2 = np.pad(gray, 1, mode="reflect")
    lap_out = np.zeros_like(gray)
    for ky in range(3):
        for kx in range(3):
            lap_out += kernel[ky, kx] * padded2[ky:ky + h, kx:kx + w]
    laplacian_score = float(np.mean(np.abs(lap_out)))

    # ── Local standard deviation uniformity ──────────────────────────────────
    block_size = h // 4
    local_stds = []
    for i in range(4):
        for j in range(4):
            block = gray[i * block_size:(i + 1) * block_size,
                         j * block_size:(j + 1) * block_size]
            local_stds.append(float(np.std(block)))
    stds_arr = np.array(local_stds) + 1e-6
    cv = float(np.std(stds_arr) / np.mean(stds_arr))
    local_std_uniformity = float(np.clip(1.0 - cv, 0.0, 1.0))

    return {
        "noise_variance":          round(noise_variance, 4),
        "laplacian_score":         round(laplacian_score, 4),
        "local_std_uniformity":    round(local_std_uniformity, 4),
    }


def run_full_frequency_analysis(pil_img: Image.Image) -> dict:
    """
    Runs the complete frequency analysis pipeline on a PIL image.
    Returns a merged dict of all frequency and noise metrics.
    """
    dct_feats   = compute_dct_features(pil_img)
    noise_feats = compute_noise_analysis(pil_img)

    # ── Noise AI Artifact Score ──────────────────────────────────────────────
    # Smooth natural gradients (e.g. skies, sunsets) have low high_freq_ratio & zero periodicity
    is_smooth_natural = (dct_feats["high_freq_ratio"] < 0.002 and dct_feats["periodicity_score"] < 0.05)
    if is_smooth_natural:
        noise_ai_score = float(np.clip(0.30 * noise_feats["local_std_uniformity"], 0.0, 1.0))
    else:
        noise_ai_score = float(np.clip(
            0.60 * (1.0 - min(noise_feats["noise_variance"] / 20.0, 1.0))
            + 0.40 * noise_feats["local_std_uniformity"],
            0.0, 1.0
        ))

    # ── Combined Frequency Verdict Score ─────────────────────────────────────
    freq_ai_score = float(np.clip(
        0.55 * dct_feats["grid_artifact_score"] + 0.45 * noise_ai_score,
        0.0, 1.0
    ))

    return {
        **dct_feats,
        **noise_feats,
        "freq_ai_score": round(freq_ai_score, 4),
    }
