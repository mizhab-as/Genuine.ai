"""
Unit tests for gradcam.py
Tests GradCAM, GradCAMPlusPlus, spatial region analysis, and overlay generation.
"""
import base64
import numpy as np
import pytest
import torch
from PIL import Image

from cifake_cnn import load_cifake_model, get_image_transforms, GenuineCoreCNN
from gradcam import (
    GradCAM, GradCAMPlusPlus, pil_to_base64,
    process_gradcam_overlay, generate_explanation,
    analyze_spatial_regions, get_dominant_region,
)


@pytest.fixture
def model_and_transform():
    model = load_cifake_model(use_temperature_scaling=False)
    transform = get_image_transforms()
    return model, transform


@pytest.fixture
def sample_tensor(model_and_transform, real_like_image):
    _, transform = model_and_transform
    tensor = transform(real_like_image).unsqueeze(0)
    tensor.requires_grad_(True)
    return tensor


class TestGradCAM:
    def test_heatmap_shape(self, model_and_transform, sample_tensor):
        model, _ = model_and_transform
        engine   = GradCAM(model, model.conv2)
        cam_np, target_class, output = engine.generate_heatmap(sample_tensor)

        assert cam_np.ndim == 2, "Heatmap should be 2D (H, W)"
        assert cam_np.min() >= 0.0, "Heatmap values should be >= 0"
        assert cam_np.max() <= 1.0, "Heatmap values should be <= 1"

    def test_target_class_valid(self, model_and_transform, sample_tensor):
        model, _ = model_and_transform
        engine   = GradCAM(model, model.conv2)
        _, target_class, output = engine.generate_heatmap(sample_tensor)
        assert target_class in (0, 1), f"Target class {target_class} should be 0 or 1"

    def test_output_logits_shape(self, model_and_transform, sample_tensor):
        model, _ = model_and_transform
        engine   = GradCAM(model, model.conv2)
        _, _, output = engine.generate_heatmap(sample_tensor)
        assert output.shape == (1, 2), f"Output shape should be (1, 2), got {output.shape}"


class TestGradCAMPlusPlus:
    def test_pp_heatmap_in_range(self, model_and_transform, sample_tensor):
        model, _ = model_and_transform
        engine   = GradCAMPlusPlus(model, model.conv2)
        cam_np, _, _ = engine.generate_heatmap(sample_tensor)
        assert cam_np.min() >= 0.0
        assert cam_np.max() <= 1.0


class TestPilToBase64:
    def test_returns_data_url(self):
        img  = Image.new("RGB", (16, 16), (100, 150, 200))
        b64  = pil_to_base64(img)
        assert b64.startswith("data:image/png;base64,")

    def test_base64_decodable(self):
        img = Image.new("RGB", (16, 16))
        b64 = pil_to_base64(img)
        raw = b64.split(",", 1)[1]
        decoded = base64.b64decode(raw)
        assert len(decoded) > 0


class TestSpatialRegions:
    def test_regions_keys(self):
        cam = np.random.rand(64, 64).astype(np.float32)
        regions = analyze_spatial_regions(cam)
        assert set(regions.keys()) == {"top_left", "top_right", "bottom_left", "bottom_right", "center"}

    def test_dominant_region_string(self):
        cam = np.zeros((64, 64), dtype=np.float32)
        cam[:32, :32] = 1.0  # top-left highest
        regions = analyze_spatial_regions(cam)
        label   = get_dominant_region(regions)
        assert isinstance(label, str)
        assert len(label) > 0


class TestGradCAMOverlay:
    def test_overlay_keys(self, real_like_image):
        cam_np = np.random.rand(8, 8).astype(np.float32)
        result = process_gradcam_overlay(real_like_image, cam_np)
        expected = {"heatmap_b64", "blended_b64", "center_intensity",
                    "overall_intensity", "max_activation", "spatial_regions", "dominant_region"}
        assert expected.issubset(result.keys())

    def test_b64_strings_valid(self, real_like_image):
        cam_np = np.ones((8, 8), dtype=np.float32) * 0.5
        result = process_gradcam_overlay(real_like_image, cam_np)
        assert result["heatmap_b64"].startswith("data:image/")
        assert result["blended_b64"].startswith("data:image/")

    def test_intensity_in_range(self, real_like_image):
        cam_np = np.random.rand(8, 8).astype(np.float32)
        result = process_gradcam_overlay(real_like_image, cam_np)
        assert 0.0 <= result["center_intensity"] <= 1.0
        assert 0.0 <= result["max_activation"] <= 1.0


class TestGenerateExplanation:
    def test_ai_explanation_not_empty(self):
        stats = {"center_intensity": 0.6, "max_activation": 0.9, "dominant_region": "upper-left background"}
        freq  = {"grid_artifact_score": 0.7, "freq_ai_score": 0.8, "periodicity_score": 0.65}
        text  = generate_explanation("ai_generated", 0.93, stats, freq)
        assert len(text) > 20
        assert isinstance(text, str)

    def test_genuine_explanation_not_empty(self):
        stats = {"center_intensity": 0.3, "max_activation": 0.4, "dominant_region": "central subject area"}
        freq  = {"grid_artifact_score": 0.1, "freq_ai_score": 0.15, "periodicity_score": 0.1}
        text  = generate_explanation("genuine", 0.94, stats, freq)
        assert len(text) > 20

    def test_works_without_freq_stats(self):
        stats = {"center_intensity": 0.5, "max_activation": 0.7, "dominant_region": "top-right background"}
        text  = generate_explanation("ai_generated", 0.88, stats, None)
        assert isinstance(text, str)
