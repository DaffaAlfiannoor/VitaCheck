import logging
import os

import joblib
import numpy as np

from schemas import LABEL_MAP

logger = logging.getLogger(__name__)

# Support env var override untuk deployment (Render, dll.)
# Default: naik 2 level dari backend/ → root repo
_default_model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model_final_svm")
MODEL_DIR = os.getenv("MODEL_DIR", _default_model_dir)
MODEL_PATH = os.path.join(MODEL_DIR, "final_health_risk_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
MODEL_INFO_PATH = os.path.join(MODEL_DIR, "final_model_info.json")


class ModelService:
    def __init__(self):
        self._scaler = None
        self._model = None
        self._info = None

    def load(self):
        import json

        logger.info(f"Loading model from: {MODEL_DIR}")
        logger.info(f"  MODEL_PATH   : {MODEL_PATH}  (exists={os.path.exists(MODEL_PATH)})")
        logger.info(f"  SCALER_PATH  : {SCALER_PATH}  (exists={os.path.exists(SCALER_PATH)})")
        logger.info(f"  INFO_PATH    : {MODEL_INFO_PATH}  (exists={os.path.exists(MODEL_INFO_PATH)})")

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")
        if not os.path.exists(MODEL_INFO_PATH):
            raise FileNotFoundError(f"Model info file not found: {MODEL_INFO_PATH}")

        self._scaler = joblib.load(SCALER_PATH)
        self._model = joblib.load(MODEL_PATH)
        with open(MODEL_INFO_PATH, "r", encoding="utf-8") as f:
            self._info = json.load(f)
        logger.info(f"Model loaded successfully: {self._info.get('model_name', 'unknown')}")
        return self

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def model_name(self) -> str:
        return self._info.get("model_name", "unknown") if self._info else "unknown"

    @property
    def model_info(self) -> dict:
        return self._info or {}

    def predict(self, inputs: dict) -> dict:
        try:
            features = [
                inputs["daily_screen_time_hours"],
                inputs["phone_usage_before_sleep_minutes"],
                inputs["sleep_duration_hours"],
                inputs["sleep_quality_score"],
                inputs["physical_activity_minutes"],
                inputs["notifications_received_per_day"],
                inputs["stress_level"],
                inputs["mental_fatigue_score"],
                inputs["caffeine_intake_cups"],
            ]
            X = np.array([features])
            X_scaled = self._scaler.transform(X)
            pred = self._model.predict(X_scaled)[0]
            proba = self._model.predict_proba(X_scaled)[0]
            class_id = int(pred)
            label = LABEL_MAP[class_id]
            return {
                "class_id": class_id,
                "label": label,
                "confidence": float(proba[class_id]),
                "probabilities": {LABEL_MAP[i]: float(proba[i]) for i in range(3)},
            }
        except Exception as e:
            logger.error(f"Prediction error: {e}", exc_info=True)
            raise
