from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import ModelInfo, PredictionInput, PredictionOutput, PredictionResult
from service import ModelService

svc = ModelService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    svc.load()
    yield


app = FastAPI(
    title="VitaCheck API",
    description="Health risk prediction API — memprediksi risiko kesehatan berdasarkan gaya hidup harian.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
def predict(body: PredictionInput):
    if not svc.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        result = svc.predict(body.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return PredictionOutput(
        model_name=svc.model_name,
        prediction=PredictionResult(
            class_id=result["class_id"],
            label=result["label"],
        ),
        confidence=result["confidence"],
        probabilities=result["probabilities"],
    )
