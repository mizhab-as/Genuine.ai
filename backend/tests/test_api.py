"""
Integration tests for Genuine.ai FastAPI endpoints.
Tests all 5 API endpoints with valid/invalid inputs.
"""
import io
import os

# Use sys.path manipulation for module resolution in tests
import sys

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


def _jpeg_bytes(image_fixture) -> tuple[bytes, str]:
    """Helper: returns (bytes, filename)."""
    buf = io.BytesIO()
    image_fixture.save(buf, format="JPEG")
    return buf.getvalue(), "test.jpg"


# ── Health ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_ok(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert "scipy_available" in data


# ── Models Registry ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_models_endpoint(client):
    resp = await client.get("/api/v1/models")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_model" in data
    assert len(data["available_models"]) >= 1
    for m in data["available_models"]:
        assert "id" in m and "accuracy" in m


# ── Analyze (General) ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_real_image(client, real_like_image):
    img_bytes, fname = _jpeg_bytes(real_like_image)
    resp = await client.post(
        "/api/v1/analyze",
        files={"file": (fname, img_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["verdict"] in ("genuine", "ai_generated")
    assert 0.0 < data["confidence"] <= 1.0
    assert "confidence_percentage" in data
    assert "request_id" in data
    assert "frequency_analysis" in data
    assert "freq_ai_score" in data["frequency_analysis"]
    assert "heatmap_b64" in data and data["heatmap_b64"].startswith("data:image/")

@pytest.mark.asyncio
async def test_analyze_ai_image(client, ai_like_image):
    img_bytes, fname = _jpeg_bytes(ai_like_image)
    resp = await client.post(
        "/api/v1/analyze",
        files={"file": (fname, img_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "verdict" in data
    assert "frequency_analysis" in data

@pytest.mark.asyncio
async def test_analyze_with_preset_ai(client, ai_like_image):
    img_bytes, fname = _jpeg_bytes(ai_like_image)
    resp = await client.post(
        "/api/v1/analyze",
        files={"file": (fname, img_bytes, "image/jpeg")},
        data={"preset_id": "ai_portrait"},
    )
    assert resp.status_code == 200
    assert resp.json()["verdict"] == "ai_generated"

@pytest.mark.asyncio
async def test_analyze_invalid_file_type(client):
    resp = await client.post(
        "/api/v1/analyze",
        files={"file": ("bad.txt", b"not an image", "text/plain")},
    )
    assert resp.status_code == 400

@pytest.mark.asyncio
async def test_analyze_tiny_image(client, tiny_image_bytes):
    resp = await client.post(
        "/api/v1/analyze",
        files={"file": ("tiny.png", tiny_image_bytes, "image/png")},
    )
    # Should succeed even on 1x1 image
    assert resp.status_code == 200

@pytest.mark.asyncio
async def test_analyze_metrics_structure(client, real_like_image):
    img_bytes, fname = _jpeg_bytes(real_like_image)
    resp = await client.post(
        "/api/v1/analyze",
        files={"file": (fname, img_bytes, "image/jpeg")},
    )
    data = resp.json()
    freq = data["frequency_analysis"]
    assert "grid_artifact_score" in freq
    assert "spectral_entropy" in freq
    assert "periodicity_score" in freq
    assert "noise_variance" in freq


# ── Analyze Face ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_face_ok(client, real_like_image):
    img_bytes, fname = _jpeg_bytes(real_like_image)
    resp = await client.post(
        "/api/v1/analyze-face",
        files={"file": (fname, img_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "face_check"
    assert data["face_detected"] is True
    assert "face_bounding_box" in data
    assert len(data["face_bounding_box"]) == 4


# ── Analyze Document ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_document_ok(client, real_like_image):
    img_bytes, fname = _jpeg_bytes(real_like_image)
    resp = await client.post(
        "/api/v1/analyze-document",
        files={"file": (fname, img_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200
    assert resp.json()["mode"] == "document_check"


# ── Analyze Video ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_video_ok(client, real_like_image):
    img_bytes, fname = _jpeg_bytes(real_like_image)
    resp = await client.post(
        "/api/v1/analyze-video",
        files={"file": (fname, img_bytes, "image/jpeg")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "video_check"
    assert "frames_timeline" in data
    assert len(data["frames_timeline"]) == 4
    for frame in data["frames_timeline"]:
        assert "frame" in frame and "score" in frame and "status" in frame


# ── Batch Analysis ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_batch_two_images(client, real_like_image, ai_like_image):
    real_bytes, _ = _jpeg_bytes(real_like_image)
    ai_bytes,   _ = _jpeg_bytes(ai_like_image)
    resp = await client.post(
        "/api/v1/analyze-batch",
        files=[
            ("files", ("real.jpg", real_bytes, "image/jpeg")),
            ("files", ("ai.jpg",   ai_bytes,   "image/jpeg")),
        ],
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_files"] == 2
    assert data["processed"] == 2
    assert data["errors"] == 0
    assert len(data["results"]) == 2


@pytest.mark.asyncio
async def test_feedback_endpoint(client):
    resp = await client.post(
        "/api/v1/feedback",
        json={
            "request_id": "req_test123",
            "user_verdict": "genuine",
            "feedback_type": "false_flag_report"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "received"
    assert data["request_id"] == "req_test123"

@pytest.mark.asyncio
async def test_batch_too_many_files(client, real_like_image):
    img_bytes, _ = _jpeg_bytes(real_like_image)
    files = [("files", (f"img{i}.jpg", img_bytes, "image/jpeg")) for i in range(6)]
    resp  = await client.post("/api/v1/analyze-batch", files=files)
    assert resp.status_code == 400
