# Contributing to Genuine.ai

Thank you for your interest in contributing! This guide covers how to set up the development environment, branch naming, and the PR process.

---

## 🛠️ Development Setup

### Prerequisites
- Python 3.10+
- Node.js v18+
- Git

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/Genuine.ai.git
cd Genuine.ai
```

### 2. Backend Setup
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
pip install pytest pytest-asyncio httpx ruff
```

### 3. Frontend Setup
```bash
cd frontend && npm install
```

### 4. Run Locally
```bash
# Backend (terminal 1)
source .venv/bin/activate && cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (terminal 2)
cd frontend && npm run dev
```

---

## 🌿 Branch Naming

| Branch | Description |
|---|---|
| `main` | Production-ready code |
| `feat/description` | New feature |
| `fix/description` | Bug fix |
| `docs/description` | Documentation update |
| `test/description` | Test additions |
| `refactor/description` | Code refactoring |

---

## ✅ Before Submitting a PR

1. **Run backend tests:** `python -m pytest backend/tests/test_frequency_analysis.py backend/tests/test_gradcam.py -v`
2. **Run backend lint:** `ruff check backend/ --select E,W,F,I --ignore E501`
3. **Run frontend lint:** `cd frontend && npm run lint`
4. **Verify build:** `cd frontend && npm run build`
5. All CI checks must pass

---

## 📝 Commit Message Format

```
type(scope): short description

feat(phase-1): add DCT frequency analysis engine
fix(backend): handle oversized file upload gracefully
test: add GradCAM++ unit tests
docs: update API reference with v1.1 response format
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `ci`

---

## 🔬 Adding a New Detection Signal

To add a new detection signal (e.g., ELA analysis):

1. Create `backend/ela_analysis.py` with a `run_ela_analysis(pil_img) -> dict` function
2. Import and call in `backend/main.py`'s `_fuse_signals()` function
3. Add typed results to `backend/schemas.py`
4. Add unit tests in `backend/tests/test_ela_analysis.py`
5. Display results in `frontend/src/components/ResultsPanel.jsx`

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
