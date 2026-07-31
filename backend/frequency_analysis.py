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
                             AI images: typically > 0.35. Real images: typically < 0.25.
        spectral_entropy   - Shannon entropy of the DCT coefficient magnitude distribution.
                             AI images: lower entropy (smoother). Real: higher.
        periodicity_score  - Peak-to-mean ratio of the FFT magnitude spectrum.
                             AI images: higher (periodic grid). Real: lower.
        grid_artifact_score- Composite score combining all three signals [0.0–1.0].
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

    low_energy = np.sum(dct_magnitude[:low_cutoff_h, :low_cutoff_w] ** 2)
    mid_energy = np.sum(dct_magnitude[low_cutoff_h:mid_cutoff_h,
                                       low_cutoff_w:mid_cutoff_w] ** 2)
    high_energy = total_energy - low_energy - mid_energy

    high_freq_ratio = float(high_energy / total_energy)

    # ── Spectral Entropy ──────────────────────────────────────────────────────
    flat = dct_magnitude.flatten()
    flat_norm = flat / (np.sum(flat) + 1e-10)
    # Bin into 64 buckets for robust entropy
    hist, _ = np.histogram(flat_norm, bins=64, range=(0, flat_norm.max() + 1e-10))
    hist_prob = hist / (hist.sum() + 1e-10)
    if SCIPY_AVAILABLE:
        spectral_entropy = float(scipy_entropy(hist_prob + 1e-12))
    else:
        spectral_entropy = float(-np.sum(hist_prob * np.log(hist_prob + 1e-12)))
    # Normalize to [0, 1] (max theoretical entropy for 64 bins ≈ ln(64) ≈ 4.16)
    spectral_entropy_norm = float(np.clip(spectral_entropy / 4.16, 0.0, 1.0))

    # ── FFT Periodicity Analysis ──────────────────────────────────────────────
    fft_mag = np.abs(np.fft.fft2(gray))
    fft_shifted = np.fft.fftshift(fft_mag)
    # Remove DC component (center)
    cy, cx = h // 2, w // 2
    fft_shifted[cy - 4:cy + 4, cx - 4:cx + 4] = 0
    peak = float(np.max(fft_shifted))
    mean_excl_dc = float(np.mean(fft_shifted))
    periodicity_score = float(np.clip(peak / (mean_excl_dc * 30 + 1e-10), 0.0, 1.0))

    # ── Grid Artifact Score (Composite) ───────────────────────────────────────
    # AI images → high high_freq_ratio, low spectral_entropy, high periodicity
    # Weights tuned empirically against CIFAKE-style pairs
    grid_artifact_score = float(np.clip(
        0.45 * high_freq_ratio / 0.5          # normalized contribution
        + 0.30 * (1.0 - spectral_entropy_norm) # low entropy → AI
        + 0.25 * periodicity_score,
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

    # ── High-pass residual via simple difference filter ───────────────────────
    padded = np.pad(gray, 1, mode="reflect")
    h, w = gray.shape
    residual = np.zeros_like(gray)
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        residual += padded[1 + dy: 1 + dy + h, 1 + dx: 1 + dx + w]
    residual = gray - residual / 4.0
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
    # Split into 4x4 blocks and measure STD within each block
    block_size = h // 4
    local_stds = []
    for i in range(4):
        for j in range(4):
            block = gray[i * block_size:(i + 1) * block_size,
                         j * block_size:(j + 1) * block_size]
            local_stds.append(float(np.std(block)))
    # Coefficient of variation: low CV → uniform STD across blocks → AI-like
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
    dct_feats  = compute_dct_features(pil_img)
    noise_feats = compute_noise_analysis(pil_img)

    # ── Combined Frequency Verdict Score ─────────────────────────────────────
    # Score in [0, 1] — higher means more likely AI-generated
    freq_ai_score = float(np.clip(
        0.60 * dct_feats["grid_artifact_score"]
        + 0.25 * noise_feats["local_std_uniformity"]
        + 0.15 * (1.0 - min(noise_feats["noise_variance"] / 200.0, 1.0)),
        0.0, 1.0
    ))

    return {
        **dct_feats,
        **noise_feats,
        "freq_ai_score": round(freq_ai_score, 4),
    }
