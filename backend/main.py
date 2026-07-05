import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt

from schemas import ModelInfo, PredictionInput, PredictionOutput, PredictionResult
from service import ModelService
from auth import router as auth_router, SECRET_KEY, ALGORITHM
from database import init_db, get_db

svc = ModelService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    svc.load()
    init_db()
    yield


app = FastAPI(
    title="VitaCheck API",
    description="Health risk prediction API — memprediksi risiko kesehatan berdasarkan gaya hidup harian.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth_router)

# Baca CORS origins dari env var (pisahkan dengan koma untuk multiple origins)
# Contoh di Render: CORS_ORIGINS=https://vitacheck.vercel.app
# Default "*" untuk pengembangan lokal
_raw_origins = os.getenv("CORS_ORIGINS", "*")
ALLOWED_ORIGINS: list[str] = (
    [o.strip() for o in _raw_origins.split(",") if o.strip()]
    if _raw_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # allow_credentials hanya boleh True jika origins bukan wildcard "*"
    allow_credentials=ALLOWED_ORIGINS != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    """Extract user_id from Bearer token if present, otherwise return None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except (JWTError, ValueError):
        return None


@app.get("/", response_model=ModelInfo, tags=["Info"])
def root():
    info = svc.model_info
    return ModelInfo(
        model_name=info.get("model_name", "unknown"),
        version="1.0.0",
        features=info.get("features", []),
        n_features=len(info.get("features", [])),
        description=(
            "Model prediksi risiko kesehatan berdasarkan 9 fitur gaya hidup. "
            f"Dipilih dari {', '.join(info.get('selection_scope', []))} "
            f"dengan prioritas recall kelas Risiko Tinggi."
        ),
    )


@app.get("/health", tags=["Info"])
def health():
    return {
        "status": "ok",
        "model_loaded": svc.is_loaded,
        "model_name": svc.model_name,
    }


@app.post("/predict", response_model=PredictionOutput, tags=["Prediction"])
def predict(body: PredictionInput, user_id: Optional[int] = Depends(get_optional_user_id)):
    if not svc.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        result = svc.predict(body.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Save to database if user is logged in
    if user_id is not None:
        inputs = body.model_dump()
        low = result["probabilities"].get("Risiko Rendah", 0)
        med = result["probabilities"].get("Risiko Sedang", 0)
        high = result["probabilities"].get("Risiko Tinggi", 0)
        risk_score = round((low * 0) + (med * 50) + (high * 100))
        try:
            with get_db() as conn:
                conn.execute(
                    """INSERT INTO predictions
                       (user_id, daily_screen_time_hours, phone_usage_before_sleep_minutes,
                        sleep_duration_hours, sleep_quality_score, physical_activity_minutes,
                        notifications_received_per_day, caffeine_intake_cups, stress_level,
                        mental_fatigue_score, risk_label, risk_score, confidence)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        user_id,
                        inputs["daily_screen_time_hours"],
                        inputs["phone_usage_before_sleep_minutes"],
                        inputs["sleep_duration_hours"],
                        inputs["sleep_quality_score"],
                        inputs["physical_activity_minutes"],
                        inputs["notifications_received_per_day"],
                        inputs["caffeine_intake_cups"],
                        inputs["stress_level"],
                        inputs["mental_fatigue_score"],
                        result["label"],
                        risk_score,
                        result["confidence"],
                    ),
                )
        except Exception:
            pass  # Don't fail prediction if save fails

    return PredictionOutput(
        model_name=svc.model_name,
        prediction=PredictionResult(
            class_id=result["class_id"],
            label=result["label"],
        ),
        confidence=result["confidence"],
        probabilities=result["probabilities"],
    )


@app.get("/predictions/history", tags=["Prediction"])
def get_prediction_history(authorization: str = Header(...)):
    """Get prediction history for the logged-in user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    with get_db() as conn:
        rows = conn.execute(
            """SELECT id, daily_screen_time_hours, phone_usage_before_sleep_minutes,
                      sleep_duration_hours, sleep_quality_score, physical_activity_minutes,
                      notifications_received_per_day, caffeine_intake_cups, stress_level,
                      mental_fatigue_score, risk_label, risk_score, confidence, created_at
               FROM predictions WHERE user_id = ? ORDER BY created_at DESC""",
            (user_id,),
        ).fetchall()

    return [dict(row) for row in rows]