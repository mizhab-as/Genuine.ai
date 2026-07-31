# Changelog

All notable changes to Genuine.ai are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] — 2026-07-31 (Phase 1–5 Complete)

### Added
- **DCT/FFT Frequency Analysis Engine** (`backend/frequency_analysis.py`)
  - `compute_dct_features()` — high-freq ratio, spectral entropy, periodicity score, grid artifact score
  - `compute_noise_analysis()` — noise variance, Laplacian sharpness, local STD uniformity
  - `run_full_frequency_analysis()` — combined `freq_ai_score` signal
- **Dual-signal detection fusion** — CNN (55%) + DCT frequency analysis (45%)
- **Temperature scaling calibration** (`TemperatureScaling`, T=1.5) on CNN output
- **Grad-CAM++** implementation alongside standard Grad-CAM
- **Spatial region analysis** — 2×2 quadrant activation breakdown + dominant region detection
- **Batch endpoint** — `POST /api/v1/analyze-batch` (up to 5 images, async parallel)
- **Pydantic v2 schemas** (`backend/schemas.py`) for all endpoints
- **Request IDs** on every API call (`req_{hex}`)
- **Structured logging** with Python's logging module
- **AppContext** React context — centralized state replacing scattered useState
- **14 React components** extracted from monolithic App.jsx
- **Session history panel** with export-to-JSON
- **Toast notifications** system
- **About modal** with research attribution + tech stack
- **Batch upload UI** with per-file results display
- **Pytest test suite** — 26 unit/integration tests
- **GitHub Actions CI** — ruff lint, pytest, oxlint, Vite build
- **pyproject.toml** — ruff, pytest, mypy configuration
- **Mobile responsive additions** — 768px/480px breakpoints
- **Print media query** for report printing

### Changed
- `backend/main.py` — full rewrite: lifespan context manager, env-variable CORS, real inference pipeline
- `backend/cifake_cnn.py` — added `TemperatureScaling`, `ModelRegistry` class
- `backend/gradcam.py` — added `GradCAMPlusPlus`, spatial region analysis, richer explanations
- `backend/requirements.txt` — added scipy, httpx, pytest, pytest-asyncio
- `frontend/src/App.jsx` — reduced from 558 to ~110 lines (thin orchestrator shell)
- `README.md` — complete rewrite with architecture diagram, detection methodology, API v1.1 docs

### Fixed
- `allow_origins=["*"]` replaced with env-variable-driven CORS origins
- `@app.on_event("startup")` deprecated hook replaced with `lifespan` context manager

---

## [1.0.0] — 2026-07-28 (Phase 1 Initial)

### Added
- `GenuineCoreCNN` — CIFAKE 2-layer CNN classifier
- Grad-CAM heatmap generation
- FastAPI backend with 4 detection endpoints
- React + Vite frontend with drag-drop upload
- Grad-CAM overlay viewer with opacity control
- Preset demo gallery
- Swagger API documentation
- Multi-modal detection modes: General, Face, Document, Video
