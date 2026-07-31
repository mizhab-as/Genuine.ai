#!/bin/bash
# =============================================================
# Genuine.ai — One-Click Launch Script v1.1
# Starts FastAPI Backend (Port 8000) & Vite Frontend (Port 5173)
# =============================================================

# Color codes
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}  ╔═══════════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}${BOLD}  ║   Genuine.ai — Know What's Real  v1.1.0  ║${RESET}"
  echo -e "${CYAN}${BOLD}  ║   CIFAKE CNN · DCT Analysis · Grad-CAM++ ║${RESET}"
  echo -e "${CYAN}${BOLD}  ╚═══════════════════════════════════════════╝${RESET}"
  echo ""
}

info()    { echo -e "${CYAN}  [INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}  [ OK ]${RESET}  $1"; }
warn()    { echo -e "${YELLOW}  [WARN]${RESET}  $1"; }
error()   { echo -e "${RED}  [ERR ]${RESET}  $1"; }

print_banner

# ── Dependency Checks ─────────────────────────────────────────────────────────
info "Checking dependencies..."

if ! command -v python3 &>/dev/null; then
  error "python3 not found. Install Python 3.10+"; exit 1
fi
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
success "Python $PYTHON_VERSION found"

if ! command -v node &>/dev/null; then
  error "Node.js not found. Install Node.js v18+"; exit 1
fi
NODE_VERSION=$(node --version)
success "Node.js $NODE_VERSION found"

# ── Port Conflict Detection ───────────────────────────────────────────────────
check_port() {
  local port=$1
  if lsof -Pi ":$port" -sTCP:LISTEN -t &>/dev/null; then
    warn "Port $port is already in use! Another service may conflict."
    return 1
  fi
  return 0
}

check_port 8000 || warn "Backend port 8000 may conflict"
check_port 5173 || warn "Frontend port 5173 may conflict"

# ── Virtual Environment ───────────────────────────────────────────────────────
info "Setting up Python virtual environment..."
if [ -d ".venv" ]; then
  source .venv/bin/activate
  success ".venv activated"
else
  info "Creating virtual environment..."
  python3 -m venv .venv
  source .venv/bin/activate
  info "Installing Python dependencies..."
  pip install -r backend/requirements.txt --quiet
  success "Dependencies installed"
fi

# ── Frontend Dependencies ─────────────────────────────────────────────────────
if [ ! -d "frontend/node_modules" ]; then
  info "Installing frontend dependencies (npm install)..."
  cd frontend && npm install --silent && cd ..
  success "Frontend dependencies installed"
fi

# ── Start Backend ─────────────────────────────────────────────────────────────
echo ""
info "Starting FastAPI backend on http://127.0.0.1:8000..."
cd backend
../.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --log-level warning &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
for i in {1..10}; do
  if curl -s http://127.0.0.1:8000/api/v1/health &>/dev/null; then
    success "Backend API is healthy (PID $BACKEND_PID)"
    break
  fi
  sleep 0.5
done

# ── Start Frontend ────────────────────────────────────────────────────────────
info "Starting Vite frontend on http://localhost:5173..."
cd frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!
cd ..

sleep 1.5

# ── Ready Banner ──────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}  ✅ Genuine.ai is running!${RESET}"
echo -e "${CYAN}  ────────────────────────────────────────${RESET}"
echo -e "${BOLD}  🌐 Web App:    ${RESET}http://localhost:5173"
echo -e "${BOLD}  📡 API Docs:   ${RESET}http://127.0.0.1:8000/docs"
echo -e "${BOLD}  📖 ReDoc:      ${RESET}http://127.0.0.1:8000/redoc"
echo -e "${BOLD}  ❤️  Health:    ${RESET}http://127.0.0.1:8000/api/v1/health"
echo -e "${CYAN}  ────────────────────────────────────────${RESET}"
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop all services"
echo ""

# ── Cleanup on Exit ───────────────────────────────────────────────────────────
trap "echo ''; info 'Shutting down Genuine.ai...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; success 'Stopped.'" EXIT

wait
