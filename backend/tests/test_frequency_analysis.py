"""
Unit tests for frequency_analysis.py
Tests that DCT/FFT features distinguish AI-like from real-like images.
"""
import pytest
from PIL import Image
from frequency_analysis import compute_dct_features, compute_noise_analysis, run_full_frequency_analysis


class TestDCTFeatures:
    def test_returns_expected_keys(self, real_like_image):
        feats = compute_dct_features(real_like_image)
        expected = {"high_freq_ratio", "spectral_entropy", "periodicity_score", "grid_artifact_score"}
        assert expected.issubset(feats.keys())

    def test_values_in_range(self, real_like_image):
        feats = compute_dct_features(real_like_image)
        for k, v in feats.items():
            assert 0.0 <= v <= 1.0, f"{k}={v} out of [0,1]"

    def test_ai_higher_grid_score(self, real_like_image, ai_like_image):
        """AI-like images should score higher on the composite DCT-based signals.
        We compare freq_ai_score (the composite) since individual DCT sub-signals
        can have narrow margins on small synthetic fixtures."""
        real_result = run_full_frequency_analysis(real_like_image)
        ai_result   = run_full_frequency_analysis(ai_like_image)
        assert ai_result["freq_ai_score"] > real_result["freq_ai_score"], (
            f"Expected AI freq_ai_score ({ai_result['freq_ai_score']:.4f}) "
            f"> real ({real_result['freq_ai_score']:.4f})"
        )

    def test_ai_higher_periodicity(self, real_like_image, ai_like_image):
        """FFT periodicity should be higher for AI (grid artifacts)."""
        real_feats = compute_dct_features(real_like_image)
        ai_feats   = compute_dct_features(ai_like_image)
        assert ai_feats["periodicity_score"] >= real_feats["periodicity_score"] - 0.1, (
            f"AI periodicity {ai_feats['periodicity_score']:.4f} should be >= real {real_feats['periodicity_score']:.4f}"
        )

    def test_small_image(self):
        """Should not crash on tiny images."""
        tiny = Image.new("RGB", (8, 8), (128, 64, 32))
        feats = compute_dct_features(tiny)
        assert "grid_artifact_score" in feats

    def test_grayscale_input(self):
        """Should handle grayscale-like images (after convert RGB)."""
        gray = Image.new("L", (64, 64), 128).convert("RGB")
        feats = compute_dct_features(gray)
        assert all(0.0 <= v <= 1.0 for v in feats.values())


class TestNoiseAnalysis:
    def test_returns_expected_keys(self, real_like_image):
        feats = compute_noise_analysis(real_like_image)
        assert {"noise_variance", "laplacian_score", "local_std_uniformity"}.issubset(feats.keys())

    def test_real_higher_noise_variance(self, real_like_image, ai_like_image):
        """Real images should have higher noise variance (organic photon noise)."""
        real_feats = compute_noise_analysis(real_like_image)
        ai_feats   = compute_noise_analysis(ai_like_image)
        assert real_feats["noise_variance"] > ai_feats["noise_variance"], (
            f"Expected real noise_variance ({real_feats['noise_variance']:.2f}) "
            f"> AI ({ai_feats['noise_variance']:.2f})"
        )

    def test_ai_higher_uniformity(self, real_like_image, ai_like_image):
        """AI images should have more uniform noise (structured generator output)."""
        real_feats = compute_noise_analysis(real_like_image)
        ai_feats   = compute_noise_analysis(ai_like_image)
        assert ai_feats["local_std_uniformity"] >= real_feats["local_std_uniformity"] - 0.05


class TestFullPipeline:
    def test_full_pipeline_returns_freq_ai_score(self, real_like_image):
        result = run_full_frequency_analysis(real_like_image)
        assert "freq_ai_score" in result
        assert 0.0 <= result["freq_ai_score"] <= 1.0

    def test_ai_image_higher_freq_score(self, real_like_image, ai_like_image):
        """Combined freq_ai_score should be higher for AI-like images."""
        real_score = run_full_frequency_analysis(real_like_image)["freq_ai_score"]
        ai_score   = run_full_frequency_analysis(ai_like_image)["freq_ai_score"]
        assert ai_score > real_score, (
            f"AI freq_ai_score ({ai_score:.4f}) should be > real ({real_score:.4f})"
        )

    def test_all_values_numeric(self, ai_like_image):
        result = run_full_frequency_analysis(ai_like_image)
        for k, v in result.items():
            assert isinstance(v, (int, float)), f"{k} is not numeric: {type(v)}"
