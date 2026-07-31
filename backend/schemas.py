"""
Pydantic v2 Schemas for Genuine.ai API
========================================
Typed request / response models for all endpoints.
"""

from __future__ import annotations
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator


# ── Shared ────────────────────────────────────────────────────────────────────

class FrequencyMetrics(BaseModel):
    """DCT/FFT frequency analysis results."""
    high_freq_ratio:      float = Field(..., ge=0.0, le=1.0, description="Ratio of energy in high-frequency DCT bands")
    spectral_entropy:     float = Field(..., ge=0.0, le=1.0, description="Normalised Shannon entropy of DCT coefficients")
    periodicity_score:    float = Field(..., ge=0.0, le=1.0, description="FFT peak-to-mean ratio (grid artifact periodicity)")
    grid_artifact_score:  float = Field(..., ge=0.0, le=1.0, description="Composite DCT grid artifact score")
    noise_variance:       float = Field(..., ge=0.0, description="High-pass residual noise variance")
    laplacian_score:      float = Field(..., ge=0.0, description="Mean absolute Laplacian (edge sharpness)")
    local_std_uniformity: float = Field(..., ge=0.0, le=1.0, description="Local STD uniformity (higher = more AI-like)")
    freq_ai_score:        float = Field(..., ge=0.0, le=1.0, description="Combined frequency-based AI probability")


class CNNMetrics(BaseModel):
    """CNN model-specific detection metrics."""
    frequency_artifact_score:    float = Field(..., ge=0.0, le=1.0)
    edge_anomaly_index:          float = Field(..., ge=0.0, le=1.0)
    background_noise_consistency: float = Field(..., ge=0.0, le=1.0)
    max_activation_intensity:    float = Field(..., ge=0.0, le=1.0)


class FaceMetrics(BaseModel):
    """Face-specific biometric detection metrics."""
    eye_reflection_symmetry: float = Field(..., ge=0.0, le=1.0)
    teeth_alignment_score:   float = Field(..., ge=0.0, le=1.0)
    ear_lobe_consistency:    float = Field(..., ge=0.0, le=1.0)


class DocumentMetrics(BaseModel):
    """Document & signature authenticity metrics."""
    stroke_pressure_uniformity:  float = Field(..., ge=0.0, le=1.0)
    rasterization_grid_artifacts: float = Field(..., ge=0.0, le=1.0)
    ink_bleeding_organic_score:  float = Field(..., ge=0.0, le=1.0)


class VideoMetrics(BaseModel):
    """Video temporal analysis metrics."""
    temporal_flicker_index:   float = Field(..., ge=0.0, le=1.0)
    interframe_mesh_warping:  float = Field(..., ge=0.0, le=1.0)
    lighting_continuity_score: float = Field(..., ge=0.0, le=1.0)


class FrameEntry(BaseModel):
    frame:     int
    timestamp: str
    score:     float
    status:    Literal["genuine", "ai_anomaly"]


# ── Health ─────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status:        Literal["healthy", "degraded"]
    service:       str
    version:       str
    model_loaded:  bool
    model_version: str
    device:        str
    scipy_available: bool


# ── Models Registry ────────────────────────────────────────────────────────────

class ModelInfo(BaseModel):
    id:          str
    name:        str
    description: str
    status:      Literal["active", "planned", "deprecated"]
    accuracy:    float = Field(..., ge=0.0, le=1.0)


class ModelsResponse(BaseModel):
    active_model:      str
    available_models:  List[ModelInfo]


# ── Analysis Responses ────────────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    request_id:             str
    verdict:                Literal["genuine", "ai_generated"]
    confidence:             float = Field(..., ge=0.0, le=1.0)
    confidence_percentage:  str
    heatmap_b64:            str
    blended_b64:            str
    original_b64:           str
    model_version:          str
    explanation:            str
    analysis_time_ms:       float
    frequency_analysis:     FrequencyMetrics
    metrics:                CNNMetrics
    # Fusion: how much each signal contributed
    cnn_weight:             float = Field(default=0.5, ge=0.0, le=1.0)
    freq_weight:            float = Field(default=0.5, ge=0.0, le=1.0)


class FaceAnalysisResponse(BaseModel):
    request_id:            str
    verdict:               Literal["genuine", "ai_generated"]
    confidence:            float
    confidence_percentage: str
    mode:                  Literal["face_check"]
    face_detected:         bool
    face_bounding_box:     List[int]
    face_crop_b64:         str
    heatmap_b64:           str
    blended_b64:           str
    original_b64:          str
    model_version:         str
    explanation:           str
    analysis_time_ms:      float
    frequency_analysis:    FrequencyMetrics
    metrics:               FaceMetrics


class DocumentAnalysisResponse(BaseModel):
    request_id:            str
    verdict:               Literal["genuine", "ai_generated"]
    confidence:            float
    confidence_percentage: str
    mode:                  Literal["document_check"]
    heatmap_b64:           str
    blended_b64:           str
    original_b64:          str
    model_version:         str
    explanation:           str
    analysis_time_ms:      float
    frequency_analysis:    FrequencyMetrics
    metrics:               DocumentMetrics


class VideoAnalysisResponse(BaseModel):
    request_id:            str
    verdict:               Literal["genuine", "ai_generated"]
    confidence:            float
    confidence_percentage: str
    mode:                  Literal["video_check"]
    frames_analyzed:       int
    frames_timeline:       List[FrameEntry]
    heatmap_b64:           str
    blended_b64:           str
    original_b64:          str
    model_version:         str
    explanation:           str
    analysis_time_ms:      float
    frequency_analysis:    FrequencyMetrics
    metrics:               VideoMetrics


# ── Batch ─────────────────────────────────────────────────────────────────────

class BatchResultItem(BaseModel):
    filename:  str
    index:     int
    verdict:   Literal["genuine", "ai_generated", "error"]
    confidence: Optional[float] = None
    confidence_percentage: Optional[str] = None
    freq_ai_score: Optional[float] = None
    grid_artifact_score: Optional[float] = None
    analysis_time_ms: Optional[float] = None
    error: Optional[str] = None


class BatchAnalysisResponse(BaseModel):
    total_files:       int
    processed:         int
    errors:            int
    ai_count:          int
    genuine_count:     int
    avg_confidence:    float
    results:           List[BatchResultItem]
    total_time_ms:     float


# ── Error ──────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error:   str
    detail:  str
    code:    int
    request_id: Optional[str] = None
