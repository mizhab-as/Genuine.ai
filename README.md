# Genuine.ai — Know What's Real.

> **A Scalable AI-Generated Content Detection Platform & Research Prototype**

[![CI](https://github.com/mizhab-as/Genuine.ai/actions/workflows/ci.yml/badge.svg)](https://github.com/mizhab-as/Genuine.ai/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.140-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-v2-EE4C2C?logo=pytorch)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-v8-646CFF?logo=vite)](https://vitejs.dev)
[![SciPy](https://img.shields.io/badge/SciPy-DCT%20Analysis-8CAAE6?logo=scipy)](https://scipy.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Genuine.ai is an authenticity-verification platform designed to detect whether images are real or AI-generated. Built on the **CIFAKE paper** (*Bird & Lotfi, IEEE Access, 2024*), it fuses a lightweight CNN classifier with **DCT frequency analysis** and **Grad-CAM++ explainability heatmaps** — revealing *why* a decision was made, not just a black-box percentage.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Dual-Signal Detection** | Fuses CNN activation (55%) + DCT frequency analysis (45%) for robust verdicts |
| **DCT/FFT Analysis** | Real signal-based detection via spectral entropy, high-freq ratio, and FFT periodicity |
| **Grad-CAM++ Heatmaps** | Spatial attention maps showing exactly which image regions triggered the verdict |
| **Calibrated Confidence** | Temperature scaling (T=1.5) prevents overconfident predictions |
| **Batch Analysis** | `/api/v1/analyze-batch` — up to 5 images analyzed in parallel |
| **4 Detection Modes** | General · Facial Deepfakes · Documents & Signatures · Video Frames |
| **Session History** | In-browser analysis history with export-to-JSON |
| **Request IDs** | Every API call tagged with `request_id` for distributed tracing |
| **Toast Notifications** | Non-blocking UX feedback on every operation |
| **About Modal** | In-app research attribution & tech stack display |

---

## 🏗️ System Architecture

```
┌─────────────────────────┐      ┌─────────────────────────────┐      ┌──────────────────────────────────────┐
│   Genuine.ai React App  │ ──▶  │     FastAPI Backend v1.1    │ ──▶  │  Detection Signal Fusion             │
│   (14 Components)       │ ◀──  │  POST /api/v1/analyze       │ ◀──  │  ┌────────────────────────────────┐  │
│   AppContext + Hooks     │      │  POST /api/v1/analyze-batch │      │  │ CNN Signal (55%)               │  │
│   Toast / History        │      │  GET  /api/v1/health        │      │  │  GenuineCoreCNN + GradCAM++    │  │
│   Batch Upload           │      │  GET  /api/v1/models        │      │  │  TemperatureScaling (T=1.5)    │  │
└─────────────────────────┘      └─────────────────────────────┘      │  ├────────────────────────────────┤  │
                                                                       │  │ DCT Signal (45%)               │  │
                                                                       │  │  High-freq ratio               │  │
                                                                       │  │  Spectral entropy              │  │
                                                                       │  │  FFT periodicity score         │  │
                                                                       │  └────────────────────────────────┘  │
                                                                       └──────────────────────────────────────┘
```

---

## 🔬 How Detection Works

### Signal 1 — CNN (GenuineCoreCNN + GradCAM++)

The `GenuineCoreCNN` architecture (2 Conv2D layers → AdaptiveAvgPool → FC classifier) is trained on the CIFAKE dataset (60K real CIFAR-10 + 60K latent-diffusion synthetic pairs). Predictions are passed through **temperature scaling** (`T=1.5`) to prevent overconfident outputs.

**Grad-CAM++** registers gradient hooks on the second Conv2D layer. After inference, it computes weighted sums of feature map activations — producing a spatial heatmap showing *exactly which image regions* influenced the verdict.

### Signal 2 — DCT Frequency Analysis

AI-generated images (especially latent diffusion models like Stable Diffusion, FLUX) leave characteristic artifacts in the **Discrete Cosine Transform** frequency space:

| Metric | AI Images | Real Images |
|---|---|---|
| **High-Freq Ratio** | `> 0.35` (grid artifacts) | `< 0.25` (organic) |
| **Spectral Entropy** | Lower (smoother distribution) | Higher (organic noise) |
| **FFT Periodicity** | High peak-to-mean ratio | Uniform |
| **Local Noise STD** | Uniform across blocks | Variable (organic) |

These signals are computed using `scipy.fft.dctn` and `numpy.fft.fft2`, requiring **no trained weights** — giving genuine detection capability even with randomly initialized CNN weights.

### Signal Fusion

```python
fused_ai_prob = 0.55 * cnn_prob_ai + 0.45 * freq_ai_score
confidence    = 0.75 + abs(fused_ai_prob - 0.5) * 0.48   # boundary-distance mapping
```

---

## 📡 API Reference

### `POST /api/v1/analyze`

**Request:** `multipart/form-data` with `file=@image.jpg`

**Response (v1.1):**
```json
{
  "request_id":           "req_4a7f29b1c3d0",
  "verdict":              "ai_generated",
  "confidence":           0.9142,
  "confidence_percentage":"91%",
  "model_version":        "genuine-core-v1",
  "explanation":          "Grad-CAM++ peak activation (89%) in upper-left background...",
  "analysis_time_ms":     38.4,
  "frequency_analysis": {
    "high_freq_ratio":     0.41,
    "spectral_entropy":    0.31,
    "periodicity_score":   0.63,
    "grid_artifact_score": 0.58,
    "noise_variance":      38.2,
    "freq_ai_score":       0.71
  },
  "metrics": {
    "frequency_artifact_score":     0.88,
    "edge_anomaly_index":           0.91,
    "background_noise_consistency": 0.24,
    "max_activation_intensity":     0.94
  },
  "cnn_weight":  0.55,
  "freq_weight": 0.45,
  "heatmap_b64": "data:image/png;base64,...",
  "blended_b64": "data:image/png;base64,..."
}
```

### `POST /api/v1/analyze-batch`

Batch analysis — up to 5 images processed in parallel:
```bash
curl -X POST "http://localhost:8000/api/v1/analyze-batch" \
  -F "files=@img1.jpg" -F "files=@img2.jpg"
```

---

## 🚀 Scalable Platform Roadmap

| Phase | Module | Status |
|---|---|---|
| **Phase 1** | Core Detection Engine (CNN + DCT) | ✅ **Live** |
| **Phase 2** | Face Deepfake Detection (MTCNN + StyleGAN) | ✅ **Live (endpoints active)** |
| **Phase 3** | Document & Signature Check | ✅ **Live (endpoints active)** |
| **Phase 4** | Video Temporal Deepfake Analysis | ✅ **Live (endpoints active)** |
| **Phase 5** | Robustness Layer (FLUX, SDXL, MJ v7 calibration) | 🗓️ Planned |
| **Phase 6** | Browser Extension & Public API Key Portal | 🗓️ Planned |

---

## 🛠️ Local Installation

### Prerequisites
- Python 3.10+ & `pip`
- Node.js v18+ & `npm`

### Quick Start
```bash
git clone https://github.com/mizhab-as/Genuine.ai.git
cd Genuine.ai

# Backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend && uvicorn main:app --host 127.0.0.1 --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Or use the launch script:
```bash
chmod +x run_app.sh && ./run_app.sh
```

- **Frontend:** http://localhost:5173
- **API Docs:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed CORS origins |
| `VITE_API_URL` | `http://localhost:8000` | Frontend API base URL |

---

## 🧪 Running Tests

```bash
cd Genuine.ai && source .venv/bin/activate
pip install pytest pytest-asyncio httpx

# Unit tests (fast — no model loading required)
python -m pytest backend/tests/test_frequency_analysis.py backend/tests/test_gradcam.py -v

# Full test suite (requires running model)
python -m pytest backend/tests/ -v --asyncio-mode=auto
```

---

## 🔬 Research Foundation

Genuine.ai replicates the approach from *Bird & Lotfi (IEEE Access, 2024)*:

- **Paper:** CIFAKE: Image Classification and Explainable Identification of AI-Generated Images
- **Dataset:** 120,000 image pairs (60K real CIFAR-10 + 60K latent-diffusion synthetic)
- **Architecture:** Lightweight 2-layer Conv2D network achieving ~93% accuracy on CIFAKE benchmark
- **Key Finding:** AI-generated images are detected via small **background artifacts** and subtle grid imperfections rather than main subject edges
- **DOI:** [10.1109/ACCESS.2024.3356122](https://ieeexplore.ieee.org/document/10409290)

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Vanilla CSS, Lucide React |
| **Backend** | FastAPI 0.140, Python 3.10+ |
| **ML Framework** | PyTorch 2, torchvision |
| **Frequency Analysis** | SciPy DCT, NumPy FFT |
| **Explainability** | Grad-CAM++ (custom implementation) |
| **Image Processing** | Pillow, OpenCV |
| **Testing** | pytest, pytest-asyncio, httpx |
| **Linting** | ruff (Python), oxlint (JS) |
| **CI/CD** | GitHub Actions |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, branch naming, and PR guidelines.

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
