# VitaCheck

Model web final dipilih dari Random Forest dan XGBoost melalui notebook
`Health_Risk_Prediction.ipynb`. Logistic Regression, SVM, dan ANN digunakan
sebagai model pembanding. ANN/TFLite bukan model utama untuk API.

## Menjalankan API

```powershell
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

Dokumentasi interaktif tersedia di `http://127.0.0.1:8000/docs`.

Dependency eksperimen notebook, termasuk TensorFlow untuk ANN/TFLite:

```powershell
python -m pip install -r requirements-notebook.txt
```

## Kontrak Prediksi

`POST /predict`

```json
{
  "daily_screen_time_hours": 8.0,
  "phone_usage_before_sleep_minutes": 75,
  "sleep_duration_hours": 5.5,
  "sleep_quality_score": 4,
  "physical_activity_minutes": 25,
  "notifications_received_per_day": 180,
  "stress_level": 8,
  "mental_fatigue_score": 8,
  "gender": "Male"
}
```

Respons:

```json
{
  "model_name": "XGBoost",
  "prediction": {"class_id": 2, "label": "Risiko Tinggi"},
  "confidence": 0.9,
  "probabilities": {
    "Risiko Rendah": 0.01,
    "Risiko Sedang": 0.09,
    "Risiko Tinggi": 0.9
  }
}
```
