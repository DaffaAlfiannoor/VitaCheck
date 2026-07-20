import os

import joblib
import numpy as np

from schemas import LABEL_MAP

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model_svm")
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

        self._scaler = joblib.load(SCALER_PATH)
        self._model = joblib.load(MODEL_PATH)
        with open(MODEL_INFO_PATH, "r") as f:
            self._info = json.load(f)
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
        features = [
            inputs["daily_screen_time_hours"],
            inputs["phone_usage_before_sleep_minutes"],
            inputs["sleep_duration_hours"],
            inputs["sleep_quality_score"],
            inputs["physical_activity_minutes"],
            inputs["notifications_received_per_day"],
            inputs["stress_level"],
            inputs["mental_fatigue_score"],
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
