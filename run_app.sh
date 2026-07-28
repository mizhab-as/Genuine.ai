#!/bin/bash
# =========================================================
# Genuine.ai — Enterprise One-Click Launch Script
# Starts FastAPI Backend (Port 8000) & Vite Frontend (Port 5173)
# =========================================================

echo "--------------------------------------------------------"
echo "  Shielding Truth with Genuine.ai Content Engine        "
echo "--------------------------------------------------------"

# 1. Activate Python virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r backend/requirements.txt
fi

# 2. Check & start FastAPI backend
echo "[1/2] Launching Genuine.ai FastAPI Backend on http://127.0.0.1:8000..."
cd backend
../.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# 3. Start Vite frontend
echo "[2/2] Launching Genuine.ai Web Interface on http://localhost:5173..."
cd frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!
cd ..

echo "--------------------------------------------------------"
echo "  Genuine.ai is now active!"
echo "  - Web App: http://localhost:5173"
echo "  - API Docs: http://127.0.0.1:8000/docs"
echo "--------------------------------------------------------"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
