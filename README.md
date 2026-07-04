# VitaCheck - Digital Health Risk Prediction

VitaCheck adalah aplikasi web cerdas yang memetakan kebiasaan digital harian Anda (seperti *screen time*, durasi tidur, dan aktivitas fisik) menjadi satu skor risiko kesehatan komprehensif menggunakan model *Machine Learning*.

## 🚀 Fitur Utama

- **Sistem Autentikasi**: Daftar, Masuk, dan Ubah Password.
- **Modul Prediksi Instan**: Hitung risiko kesehatan berdasarkan 9 variabel gaya hidup secara real-time.
- **Rekomendasi Preventif**: Saran kesehatan yang dipersonalisasi berdasarkan faktor risiko paling dominan.
- **Dashboard & Analitik**: Lacak skor risiko, histori prediksi, dan faktor yang paling memengaruhi.
- **Manajemen Profil**: Atur target kesehatan (Health Target) dan tinjau riwayat gaya hidup.

## 🛠 Teknologi yang Digunakan

- **Frontend**: React (Vite), Tailwind CSS, React Router.
- **Backend**: FastAPI, Python, SQLite (untuk database pengguna & histori).
- **Machine Learning**: Scikit-learn (Random Forest / XGBoost) di-serialize dengan Joblib.

## 📁 Struktur Direktori

- `/backend` - Kode sumber API (FastAPI), logika autentikasi (`auth.py`), database (`database.py`), dan router.
- `/frontend` - Kode sumber antarmuka pengguna (React), komponen UI, dan pemanggilan API.
- `/model_final` - Model Machine Learning (AI) pre-trained dan file konfigurasi *scaler*.
- `vitacheck.db` - Database lokal SQLite (terbuat secara otomatis jika belum ada).

---

## 💻 Panduan Instalasi dan Menjalankan Proyek

Pastikan Anda telah menginstal **Python 3.9+** dan **Node.js (versi LTS)**.

### 1. Menjalankan Backend (FastAPI)

1. Buka terminal, pastikan berada di folder `backend`.
2. Jika belum, instal semua dependensi Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Jalankan server backend (Uvicorn):
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. Backend API akan berjalan di `http://127.0.0.1:8000`. Dokumentasi API (Swagger UI) dapat diakses di `http://127.0.0.1:8000/docs`.

### 2. Menjalankan Frontend (React)

1. Buka tab terminal baru, navigasikan ke folder `frontend`.
   ```bash
   cd frontend
   ```
2. Instal pustaka npm:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Aplikasi web akan dapat diakses melalui browser di alamat yang tertera di terminal (biasanya `http://localhost:5173`).

---

## 📊 Kontrak API Prediksi (Contoh)

Endpoint: `POST /predict` (Membutuhkan Bearer Token dari Login)

**Request Payload:**
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
  "caffeine_intake_cups": 2
}
```

**Response Payload:**
```json
{
  "model_name": "Random Forest",
  "prediction": {"class_id": 2, "label": "Risiko Tinggi"},
  "confidence": 0.9,
  "probabilities": {
    "Risiko Rendah": 0.01,
    "Risiko Sedang": 0.09,
    "Risiko Tinggi": 0.9
  }
}
```

---
*Catatan: Aplikasi ini merupakan prototipe riset dan bukan merupakan alat diagnosis medis resmi.*
