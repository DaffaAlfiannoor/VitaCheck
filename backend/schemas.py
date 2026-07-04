from pydantic import BaseModel, Field, field_validator


LABEL_MAP = {0: "Risiko Rendah", 1: "Risiko Sedang", 2: "Risiko Tinggi"}


class PredictionInput(BaseModel):
    daily_screen_time_hours: float = Field(
        ..., ge=0.0, le=14.0, description="Total screen time per day in hours"
    )
    phone_usage_before_sleep_minutes: int = Field(
        ..., ge=0, le=120, description="Phone usage before sleep in minutes"
    )
    sleep_duration_hours: float = Field(
        ..., ge=4.0, le=9.0, description="Sleep duration per night in hours"
    )
    sleep_quality_score: int = Field(
        ..., ge=1, le=10, description="Sleep quality score (1-10, 10=best)"
    )
    physical_activity_minutes: int = Field(
        ..., ge=0, le=120, description="Daily physical activity in minutes"
    )
    notifications_received_per_day: int = Field(
        ..., ge=20, le=299, description="Number of notifications received per day"
    )
    caffeine_intake_cups: int = Field(
        ..., ge=0, le=4, description="Daily caffeine intake in cups"
    )
    stress_level: int = Field(
        ..., ge=1, le=10, description="Stress level (1-10, 10=highest)"
    )
    mental_fatigue_score: int = Field(
        ..., ge=1, le=10, description="Mental fatigue score (1-10, 10=worst)"
    )

    @field_validator(
        "sleep_quality_score",
        "stress_level",
        "mental_fatigue_score",
    )
    @classmethod
    def validate_one_to_ten(cls, v):
        if v < 1 or v > 10:
            raise ValueError("Must be between 1 and 10")
        return v


class PredictionResult(BaseModel):
    class_id: int = Field(..., description="0=Rendah, 1=Sedang, 2=Tinggi")
    label: str = Field(..., description="Risk label in Indonesian")


class PredictionOutput(BaseModel):
    model_name: str = Field(..., description="Name of the model used")
    prediction: PredictionResult
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    probabilities: dict[str, float] = Field(
        ..., description="Probability per risk class"
    )


class ModelInfo(BaseModel):
    model_name: str
    version: str
    features: list[str]
    n_features: int
    description: str
