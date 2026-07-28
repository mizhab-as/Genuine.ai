# Genuine.ai — Know What's Real.

> **A Scalable AI-Generated Content Detection Platform & Research Prototype**

[![FastAPI](https://img.shields.io/badge/FastAPI-v0.140-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-v2.13-EE4C2C?logo=pytorch)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-v8.1-646CFF?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Genuine.ai is an authenticity-verification platform designed to detect whether images are real or AI-generated. Built on the research foundation of the **CIFAKE paper** (*Bird & Lotfi, IEEE Access, 2024*), Genuine.ai pairs a lightweight CNN classifier with **Grad-CAM explainability heatmaps**, visually demonstrating *why* a decision was made rather than presenting a black-box percentage.

---

## 📌 Key Features (Phase 1 Deliverable)

- **Grad-CAM Visual Proof:** Exposes micro-artifacts and synthetic background grid patterns that influenced the verdict.
- **Explainable Verdict Badges:** Provides plain-language explanations along with confidence scores and quantitative metrics.
- **Versioned API Architecture:** Clean `/api/v1/analyze` REST endpoint built with FastAPI.
- **Interactive Heatmap Inspector:** Toggle between original image, pure Grad-CAM heatmap, and blended overlay with adjustable opacity controls.
- **Built-in Quick Test Gallery:** One-click sample analysis for instant out-of-the-box demonstration.
- **Scalable Product Vision:** Built from day one as an extensible platform with a clear 6-phase roadmap (Faces, Documents, Video, Cross-Generator Robustness, and Browser Extension).

---

## 🏗️ System Architecture

```
┌─────────────────────────┐      ┌─────────────────────────────┐      ┌──────────────────────────────┐
│   Genuine.ai Web App    │ ---> │     FastAPI Backend         │ ---> │    Genuine Core v1 (CNN)     │
│   (Vite + React UI)     │ <--- │    (POST /api/v1/analyze)    │ <--- │    + PyTorch Grad-CAM        │
└─────────────────────────┘      └─────────────────────────────┘      └──────────────────────────────┘
  - Drag & Drop Dropzone           - OpenAPI / Swagger Docs             - CIFAKE lightweight CNN
  - Live Grad-CAM Overlay          - Image Preprocessing (RGB)          - Layer 2 conv target hooks
  - Heatmap Opacity Controls       - Versioned REST API Architecture    - Plain-language explanation
  - Built-in Sample Gallery        - Health & Model Registry            - Feature metric breakdown
```

---

## 🔬 Research Foundation (CIFAKE Paper)

Genuine.ai's detection engine replicates the approach from *Bird & Lotfi (IEEE Access, 2024)*:
- **Dataset:** 120,000 image pairs (60,000 real CIFAR-10 images + 60,000 latent-diffusion synthetic equivalents).
- **Architecture:** Lightweight 2-layer Conv2D network + Dense Classifier achieving ~93% accuracy.
- **Explainability:** Grad-CAM shows that AI-generated images are typically detected via small background artifacts and subtle grid imperfections rather than main subject edges, building user trust through visual proof.

---

## 🚀 Scalable Platform Roadmap (Phases 1 – 6)

| Phase | Module | Technical Description | Status |
|---|---|---|---|
| **Phase 1** | **Core Detection Engine** | CIFAKE CNN classifier + Grad-CAM explainability heatmaps | ✅ **Delivered** |
| **Phase 2** | **Face-Specific Detection** | MTCNN region cropping + StyleGAN & FaceForensics++ deepfake classifier (`/api/v1/analyze-face`) | 🗓️ Planned |
| **Phase 3** | **Document & Signature Check** | Forgery detection for synthetic pen strokes and rasterization scans (`/api/v1/analyze-document`) | 🗓️ Planned |
| **Phase 4** | **Video Temporal Deepfakes** | CNN-LSTM frame-to-frame temporal consistency analyzer (`/api/v1/analyze-video`) | 🗓️ Planned |
| **Phase 5** | **Robustness Layer** | Continuous calibration for FLUX.1, SDXL, Midjourney v7 with unknown sample flagging | 🗓️ Planned |
| **Phase 6** | **Browser Extension & API** | Chrome extension right-click detector & public developer API key portal | 🗓️ Planned |

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Clone Repository & Setup Virtual Environment
```bash
git clone https://github.com/mizhab-as/Genuine.ai.git
cd Genuine.ai

python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Run FastAPI Backend
```bash
cd backend
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- Swagger API Docs available at: `http://127.0.0.1:8000/docs`

### 3. Run Frontend Web Interface
```bash
cd frontend
npm install
npm run dev
```
- Web Application available at: `http://localhost:5173`

---

## 📡 API Reference

### `POST /api/v1/analyze`

**Request:** `multipart/form-data` with `file=@image.jpg`

**Response:**
```json
{
  "verdict": "ai_generated",
  "confidence": 0.942,
  "confidence_percentage": "94%",
  "heatmap_b64": "data:image/png;base64,...",
  "blended_b64": "data:image/png;base64,...",
  "model_version": "genuine-core-v1",
  "explanation": "Detection triggered by latent diffusion background grid patterns and edge transition anomalies.",
  "analysis_time_ms": 38.4,
  "metrics": {
    "frequency_artifact_score": 0.88,
    "edge_anomaly_index": 0.91,
    "background_noise_consistency": 0.24
  }
}
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
