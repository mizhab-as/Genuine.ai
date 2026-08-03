"""
Pytest fixtures for Genuine.ai backend tests.
"""
import io
import sys
import os
import pytest
import numpy as np
from PIL import Image

# Ensure backend module is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


@pytest.fixture
def real_like_image() -> Image.Image:
    """
    Creates a synthetic 'real photograph'-like PIL image:
    - Organic noise (high variance)
    - Non-periodic textures
    - Natural color gradients
    """
    np.random.seed(7)
    arr = np.zeros((128, 128, 3), dtype=np.uint8)
    for i in range(128):
        blend = 1.0 / (1.0 + np.exp(-(i - 64) / 8.0))
        sky = np.array([30 + i * 1.5, 100 + i * 0.5, 180], dtype=np.float32)
        ground = np.array([34, 85, 34], dtype=np.float32)
        arr[i, :] = (1.0 - blend) * sky + blend * ground
    noise = np.random.normal(0, 18, arr.shape).astype(np.int16)
    arr   = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


@pytest.fixture
def ai_like_image() -> Image.Image:
    """
    Creates a synthetic 'AI generated'-like PIL image:
    - High-frequency grid artifacts (latent diffusion signature)
    - Smooth gradients
    - Low organic noise
    """
    np.random.seed(42)
    arr = np.zeros((128, 128, 3), dtype=np.uint8)
    # Smooth background gradient
    for i in range(128):
        arr[i, :] = [int(20 + i * 1.5), int(15 + i * 0.8), int(60 + i * 0.5)]
    # Add high-frequency grid (latent diffusion artifact)
    x, y = np.meshgrid(np.arange(128), np.arange(128))
    grid  = (np.sin(x / 4.0) * np.cos(y / 4.0) * 30).astype(np.int16)
    for c in range(3):
        arr[:, :, c] = np.clip(arr[:, :, c].astype(np.int16) + grid, 0, 255)
    # Minimal noise
    noise = np.random.normal(0, 3, arr.shape).astype(np.int16)
    arr   = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


@pytest.fixture
def real_image_bytes(real_like_image) -> bytes:
    buf = io.BytesIO()
    real_like_image.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def ai_image_bytes(ai_like_image) -> bytes:
    buf = io.BytesIO()
    ai_like_image.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def tiny_image_bytes() -> bytes:
    """1×1 white pixel for edge case testing."""
    img = Image.new("RGB", (1, 1), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
