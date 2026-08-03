#!/bin/bash
# =============================================================
# Genuine.ai — Developer Run Script (dev.sh)
# Usage:
#   ./dev.sh           — start backend + frontend
#   ./dev.sh backend   — backend only
#   ./dev.sh frontend  — frontend only
#   ./dev.sh test      — run test suite
#   ./dev.sh check     — error-check everything (no servers)
# =============================================================

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
R='\033[0;31m' G='\033[0;32m' C='\033[0;36m'
Y='\033[1;33m' B='\033[1m'   X='\033[0m'

ok()   { echo -e "${G}  [ OK ]${X}  $*"; }
info() { echo -e "${C}  [....] ${X} $*"; }
warn() { echo -e "${Y}  [WARN]${X}  $*"; }
fail() { echo -e "${R}  [FAIL]${X}  $*"; exit 1; }
hdr()  { echo -e "\n${B}${C}  ═══ $* ═══${X}\n"; }

MODE="${1:-all}"

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${C}${B}  ╔═══════════════════════════════════════════════╗${X}"
echo -e "${C}${B}  ║  Genuine.ai — Know What's Real  v1.1.0       ║${X}"
echo -e "${C}${B}  ║  CIFAKE CNN · DCT Analysis · Grad-CAM++      ║${X}"
echo -e "${C}${B}  ╚═══════════════════════════════════════════════╝${X}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Dependency check helper ───────────────────────────────────────────────────
check_deps() {
  hdr "Checking system dependencies"

  command -v python3 &>/dev/null \
    && ok "python3 $(python3 --version 2>&1 | awk '{print $2}') found" \
    || fail "python3 not found — install Python 3.10+"

  command -v node &>/dev/null \
    && ok "node $(node --version) found" \
    || fail "Node.js not found — install Node.js v18+"

  command -v npm &>/dev/null \
    && ok "npm $(npm --version) found" \
    || fail "npm not found"
}

# ── Python venv ───────────────────────────────────────────────────────────────
setup_venv() {
  hdr "Python virtual environment"
  if [ ! -d ".venv" ]; then
    info "Creating .venv..."
    python3 -m venv .venv
    ok ".venv created"
  fi
  source .venv/bin/activate
  ok ".venv activated"

  # Install missing packages silently
  python -c "import fastapi, torch, cv2, scipy, PIL" 2>/dev/null || {
    info "Installing backend requirements..."
    pip install -r backend/requirements.txt -q
    ok "Backend requirements installed"
  }
}

# ── Frontend deps ─────────────────────────────────────────────────────────────
setup_frontend() {
  if [ ! -d "frontend/node_modules" ]; then
    hdr "Frontend dependencies"
    info "Running npm install..."
    (cd frontend && npm install --silent)
    ok "node_modules installed"
  fi
}

# ── Port check ─────────────────────────────────────────────────────────────────
port_free() {
  local port=$1
  lsof -Pi ":$port" -sTCP:LISTEN -t &>/dev/null && return 1 || return 0
}

wait_healthy() {
  local url=$1 label=$2 tries=0
  info "Waiting for $label to be ready..."
  until curl -sf "$url" &>/dev/null || [ $tries -ge 20 ]; do
    sleep 0.5; tries=$((tries+1))
  done
  [ $tries -lt 20 ] && ok "$label is up" || warn "$label did not respond in 10s"
}

# =============================================================================
# MODE: check — static error checking only, no servers
# =============================================================================
if [ "$MODE" = "check" ]; then
  hdr "Static Error Check"
  check_deps
  setup_venv

  # Python syntax check on all backend files
  info "Checking Python syntax..."
  ERRORS=0
  for f in backend/*.py backend/tests/*.py; do
    [ -f "$f" ] || continue
    python -m py_compile "$f" 2>&1 && ok "  $f" || { warn "  SYNTAX ERROR: $f"; ERRORS=$((ERRORS+1)); }
  done

  # Import check
  info "Checking module imports..."
  python - <<'PYCHECK'
import sys
sys.path.insert(0, "backend")
mods = ["frequency_analysis", "cifake_cnn", "gradcam", "schemas", "main"]
all_ok = True
for m in mods:
    try:
        __import__(m)
        print(f"  \033[0;32m✓ {m}\033[0m")
    except Exception as e:
        print(f"  \033[0;31m✗ {m}: {e}\033[0m")
        all_ok = False
sys.exit(0 if all_ok else 1)
PYCHECK

  # Frontend lint
  info "Running oxlint (frontend)..."
  (cd frontend && npm run lint 2>&1) && ok "oxlint passed" || warn "oxlint reported issues"

  # Frontend build
  info "Running Vite build..."
  (cd frontend && npm run build 2>&1 | tail -5) && ok "Vite build succeeded" || fail "Vite build FAILED"

  echo ""
  if [ "$ERRORS" -eq 0 ]; then
    echo -e "${G}${B}  ✅ All checks passed — no errors found.${X}"
  else
    echo -e "${R}${B}  ❌ $ERRORS error(s) found.${X}"
    exit 1
  fi
  exit 0
fi

# =============================================================================
# MODE: test — run pytest suite
# =============================================================================
if [ "$MODE" = "test" ]; then
  hdr "Running Test Suite"
  check_deps
  setup_venv

  python -m pytest \
    backend/tests/test_frequency_analysis.py \
    backend/tests/test_gradcam.py \
    backend/tests/test_api.py \
    -v --tb=short --asyncio-mode=auto \
    2>&1

  echo ""
  ok "Test run complete."
  exit 0
fi

# =============================================================================
# MODE: backend — backend only
# =============================================================================
start_backend() {
  hdr "Starting FastAPI Backend"
  port_free 8000 || warn "Port 8000 already in use — may conflict"
  info "Launching uvicorn on http://127.0.0.1:8000 ..."
  cd backend
  ../.venv/bin/uvicorn main:app \
    --host 127.0.0.1 --port 8000 \
    --reload --log-level info &
  BACKEND_PID=$!
  cd ..
  wait_healthy "http://127.0.0.1:8000/api/v1/health" "FastAPI backend"
}

# =============================================================================
# MODE: frontend — frontend only
# =============================================================================
start_frontend() {
  hdr "Starting Vite Frontend"
  port_free 5173 || warn "Port 5173 already in use — may conflict"
  info "Launching Vite dev server on http://localhost:5173 ..."
  (cd frontend && npm run dev -- --port 5173) &
  FRONTEND_PID=$!
  sleep 1.5
  ok "Vite dev server started (PID $FRONTEND_PID)"
}

# =============================================================================
# MODE: all (default)
# =============================================================================
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  info "Shutting down Genuine.ai..."
  [ -n "$BACKEND_PID"  ] && kill "$BACKEND_PID"  2>/dev/null && ok "Backend stopped"
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && ok "Frontend stopped"
  ok "All services stopped. Goodbye."
}
trap cleanup EXIT INT TERM

check_deps
setup_venv
setup_frontend

case "$MODE" in
  backend)  start_backend ;;
  frontend) start_frontend ;;
  all)
    start_backend
    start_frontend
    ;;
  *)
    fail "Unknown mode '$MODE'. Usage: ./dev.sh [all|backend|frontend|test|check]"
    ;;
esac

# ── Ready summary ─────────────────────────────────────────────────────────────
echo ""
echo -e "${G}${B}  ✅ Genuine.ai is running!${X}"
echo -e "${C}  ──────────────────────────────────────────${X}"
[ "$MODE" != "frontend" ] && echo -e "${B}  📡 Backend API:  ${X}http://127.0.0.1:8000"
[ "$MODE" != "frontend" ] && echo -e "${B}  📖 Swagger Docs: ${X}http://127.0.0.1:8000/docs"
[ "$MODE" != "backend"  ] && echo -e "${B}  🌐 Web App:      ${X}http://localhost:5173"
echo -e "${C}  ──────────────────────────────────────────${X}"
echo -e "  Press ${B}Ctrl+C${X} to stop all services"
echo ""

wait
