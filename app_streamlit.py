import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import streamlit as st

st.set_page_config(
    page_title="VitaCheck",
    page_icon="V",
    layout="wide",
    initial_sidebar_state="expanded",
)

LABEL_MAP = {0: "Risiko Rendah", 1: "Risiko Sedang", 2: "Risiko Tinggi"}
COLOR_MAP = {"Risiko Rendah": "#639922", "Risiko Sedang": "#ef9f27", "Risiko Tinggi": "#c92a2a"}
COLOR_BG = {"Risiko Rendah": "#eaf3de", "Risiko Sedang": "#faeeda", "Risiko Tinggi": "#fcebeb"}

SLEEP_QUALITY_MAP = {"Segar": 9, "Biasa saja": 5, "Lelah": 2}
STRESS_MAP = {"Rendah": 3, "Sedang": 6, "Tinggi": 9}
FATIGUE_MAP = {"Baik": 9, "Cukup": 5, "Buruk": 2}
REVERSE_STRESS = {v: k for k, v in STRESS_MAP.items()}

def _map_notif(slider_val):
    return int(20 + ((slider_val - 1) / 9) * 279)

DEFAULT_INPUTS = {
    "daily_screen_time_hours": 5.2,
    "phone_usage_before_sleep_minutes": 60,
    "sleep_duration_hours": 6.5,
    "sleep_quality_score": "Biasa saja",
    "physical_activity_minutes": 32,
    "notifications_received_per_day": 5,
    "caffeine_intake_cups": 2,
    "stress_level": "Sedang",
    "mental_fatigue_score": "Cukup",
}

@st.cache_resource
def load_model(_scaler_mtime=None, _model_mtime=None):
    scaler = joblib.load("model_final/scaler.pkl")
    model = joblib.load("model_final/final_health_risk_model.joblib")
    return scaler, model

def get_model():
    s_mtime = os.path.getmtime("model_final/scaler.pkl")
    m_mtime = os.path.getmtime("model_final/final_health_risk_model.joblib")
    return load_model(s_mtime, m_mtime)

def predict_risk(scaler, model, inputs):
    features = [
        inputs["daily_screen_time_hours"],
        inputs["phone_usage_before_sleep_minutes"],
        inputs["sleep_duration_hours"],
        SLEEP_QUALITY_MAP[inputs["sleep_quality_score"]],
        inputs["physical_activity_minutes"],
        _map_notif(inputs["notifications_received_per_day"]),
        inputs["caffeine_intake_cups"],
        STRESS_MAP[inputs["stress_level"]],
        FATIGUE_MAP[inputs["mental_fatigue_score"]],
    ]
    X = np.array([features])
    X_scaled = scaler.transform(X)
    pred = model.predict(X_scaled)[0]
    proba = model.predict_proba(X_scaled)[0]
    label = LABEL_MAP[int(pred)]
    return {
        "class_id": int(pred),
        "label": label,
        "confidence": float(proba[int(pred)]),
        "probabilities": {LABEL_MAP[i]: float(proba[i]) for i in range(3)},
    }

def _get_daily_tip(inputs, result):
    if not result:
        return "Kurangi layar 1 jam sebelum tidur untuk membantu meningkatkan kualitas istirahat."
    label = result["label"]
    if label == "Risiko Rendah":
        return "Pola hidupmu sudah baik! Pertahankan kebiasaan sehat dan tetap aktif bergerak setiap hari."
    if label == "Risiko Tinggi":
        return "Segera evaluasi gaya hidupmu. Konsultasi dengan ahli kesehatan sangat dianjurkan."
    factors = _compute_factor_contributions(inputs)
    top = max(factors, key=lambda x: x[1])
    tips = {
        "Screen time berlebih": "Kurangi screen time maksimal 4 jam/hari untuk menurunkan risiko kesehatan.",
        "HP sebelum tidur": "Hindari HP 1 jam sebelum tidur — cahaya biru mengganggu produksi melatonin.",
        "Kurang tidur": "Tidur 7-9 jam per malam sangat penting untuk pemulihan tubuh dan fungsi otak.",
        "Kualitas tidur buruk": "Coba rutinitas tidur yang konsisten dan hindari kafein di malam hari.",
        "Aktivitas fisik rendah": "Sisihkan 30 menit untuk jalan kaki atau olahraga ringan hari ini.",
        "Notifikasi berlebih": "Aktifkan mode Jangan Ganggu (DND) saat bekerja atau tidur.",
        "Stres tinggi": "Coba teknik pernapasan 4-7-8 selama 2 menit saat merasa stres.",
        "Kelelahan mental": "Ambil jeda 5 menit setiap 1 jam kerja — istirahat singkat memulihkan fokus.",
        "Konsumsi kafein": "Batasi kafein maksimal 2 cangkir/hari dan hindari setelah jam 4 sore.",
    }
    return tips.get(top[0], tips["Screen time berlebih"])

def sidebar_nav():
    with st.sidebar:
        col1, col2 = st.columns([1, 3])
        with col1:
            st.markdown(
                "<div style=\"width:42px;height:42px;border-radius:14px;background:#185fa5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;\">V</div>",
                unsafe_allow_html=True,
            )
        with col2:
            st.markdown("**VitaCheck**  \nHealth Risk Prediction")
        st.divider()
        pages = ["Dashboard", "Kuesioner", "Hasil Prediksi", "Profil"]
        for i, page in enumerate(pages):
            if st.button(page, use_container_width=True, key=f"nav_{i}"):
                st.session_state["page"] = page
        st.divider()
        st.caption("Tips hari ini")
        inputs = st.session_state.get("last_inputs")
        result = st.session_state.get("last_result")
        st.info(_get_daily_tip(inputs, result))

def _risk_description(label):
    d = {
        "Risiko Rendah": "Pola gaya hidupmu sudah cukup baik. Pertahankan kebiasaan sehatmu!",
        "Risiko Sedang": "Beberapa faktor risiko perlu diperhatikan, terutama screen time dan durasi tidur.",
        "Risiko Tinggi": "Pola gaya hidupmu menunjukkan risiko tinggi. Segera lakukan perbaikan pada kebiasaan harian.",
    }
    return d.get(label, "")

def _recommendations_html(label):
    recs = {
        "Risiko Rendah": [
            ("#639922", "Pertahankan kebiasaan baik", "Kualitas tidur dan aktivitas fisikmu sudah baik."),
        ],
        "Risiko Sedang": [
            ("#185fa5", "Kurangi screen time malam", "Hindari penggunaan layar 1 jam sebelum tidur."),
            ("#3b6d11", "Tambah durasi olahraga", "Usahakan mencapai 45 menit aktivitas fisik harian."),
        ],
        "Risiko Tinggi": [
            ("#c92a2a", "Segera evaluasi gaya hidup", "Konsultasi dengan ahli kesehatan dianjurkan."),
            ("#185fa5", "Batasi screen time", "Kurangi screen time maksimal 4 jam per hari."),
        ],
    }
    html = ""
    for bar_color, title, desc in recs.get(label, []):
        html += f"""<div style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid #e2e8f0;">
        <div style="width:4px;border-radius:999px;background:{bar_color};flex-shrink:0;"></div>
        <div><h4 style="font-size:14px;margin-bottom:4px;">{title}</h4>
        <p style="font-size:13px;color:#64748b;">{desc}</p></div></div>"""
    return html

def _metric_cards(inputs, result):
    if not inputs:
        inputs = DEFAULT_INPUTS
    sc = inputs.get("daily_screen_time_hours", 0)
    sd = inputs.get("sleep_duration_hours", 0)
    pa = inputs.get("physical_activity_minutes", 0)
    sl = inputs.get("stress_level", "Sedang")
    cf = inputs.get("caffeine_intake_cups", 2)
    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.markdown(
            f"""<div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div style="width:36px;height:36px;border-radius:12px;background:#eaf3de;color:#3b6d11;display:flex;align-items:center;justify-content:center;">\U0001f3c3</div>
            <span style="background:#eaf3de;color:#3b6d11;padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{"Aktif" if pa >= 30 else "Kurang"}</span></div>
            <h4 style="font-size:13px;color:#64748b;margin-bottom:7px;">Aktivitas fisik</h4>
            <div style="font-size:28px;font-weight:700;color:#102a43;">{pa}<small style="font-size:14px;color:#64748b;font-weight:500;"> mnt</small></div>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">{"Tercapai" if pa >= 45 else f"Kurang {45-pa} menit"}</div></div>""",
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            f"""<div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div style="width:36px;height:36px;border-radius:12px;background:#eeedfe;color:#534ab7;display:flex;align-items:center;justify-content:center;">\U0001f319</div>
            <span style="background:#faeeda;color:#633806;padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{"Kurang" if sd < 7 else "Cukup"}</span></div>
            <h4 style="font-size:13px;color:#64748b;margin-bottom:7px;">Tidur semalam</h4>
            <div style="font-size:28px;font-weight:700;color:#102a43;">{sd}<small style="font-size:14px;color:#64748b;font-weight:500;"> jam</small></div>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">{"Cukup" if sd >= 7 else f"Kurang {7-sd:.1f} jam"}</div></div>""",
            unsafe_allow_html=True,
        )
    with c3:
        st.markdown(
            f"""<div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div style="width:36px;height:36px;border-radius:12px;background:#faeeda;color:#854f0b;display:flex;align-items:center;justify-content:center;">\U0001f4bb</div>
            <span style="background:#faeeda;color:#633806;padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{"Tinggi" if sc > 4 else "Normal"}</span></div>
            <h4 style="font-size:13px;color:#64748b;margin-bottom:7px;">Screen time</h4>
            <div style="font-size:28px;font-weight:700;color:#102a43;">{sc}<small style="font-size:14px;color:#64748b;font-weight:500;"> jam</small></div>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">{"Melebihi batas" if sc > 4 else "Dalam batas wajar"}</div></div>""",
            unsafe_allow_html=True,
        )
    with c4:
        sl_str = sl if isinstance(sl, str) else REVERSE_STRESS.get(sl, "Sedang")
        st.markdown(
            f"""<div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div style="width:36px;height:36px;border-radius:12px;background:#fcebeb;color:#a32d2d;display:flex;align-items:center;justify-content:center;">\u26a1</div>
            <span style="background:#fcebeb;color:#a32d2d;padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{sl_str}</span></div>
            <h4 style="font-size:13px;color:#64748b;margin-bottom:7px;">Tingkat stres</h4>
            <div style="font-size:28px;font-weight:700;color:#102a43;">{sl_str}</div>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">Berdasarkan kuesioner</div></div>""",
            unsafe_allow_html=True,
        )
    with c5:
        st.markdown(
            f"""<div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div style="width:36px;height:36px;border-radius:12px;background:#f3e5f5;color:#7b1fa2;display:flex;align-items:center;justify-content:center;">\u2615</div>
            <span style="background:#f3e5f5;color:#7b1fa2;padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{"Tinggi" if cf >= 3 else "Normal"}</span></div>
            <h4 style="font-size:13px;color:#64748b;margin-bottom:7px;">Kafein</h4>
            <div style="font-size:28px;font-weight:700;color:#102a43;">{cf}<small style="font-size:14px;color:#64748b;font-weight:500;"> cangkir</small></div>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">{"Konsumsi tinggi" if cf >= 3 else "Dalam batas wajar"}</div></div>""",
            unsafe_allow_html=True,
        )

def page_dashboard(scaler, model):
    st.title("Dashboard")
    st.caption("Ringkasan risiko kesehatan berdasarkan gaya hidup harian.")
    inputs = st.session_state.get("last_inputs")
    result = st.session_state.get("last_result")
    if result:
        label = result["label"]
        color = COLOR_MAP[label]
        bg = COLOR_BG[label]
        col_left, col_right = st.columns([1.35, 0.9])
        with col_left:
            st.markdown(
                f"""<div style="background:linear-gradient(135deg,#e6f1fb,#fff);border:1px solid #b8d7f4;border-radius:22px;padding:28px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div><span style="background:{bg};color:{color};padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">\u25cf Risiko kesehatan kamu</span>
                <h3 style="font-size:38px;color:#0c447c;margin:16px 0 8px;">{label.replace("Risiko ","")}</h3>
                <p style="color:#41627f;font-size:15px;">{_risk_description(label)}</p></div>
                <span style="background:{bg};color:{color};padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{datetime.now().strftime("%d %b %H:%M")}</span></div>
                <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:24px 0 8px;">
                {"".join(f"<div style=\"height:9px;border-radius:999px;background:{c};\"></div>" for c in _risk_segments(result["class_id"]))}</div>
                <div style="display:flex;justify-content:space-between;color:#185fa5;font-size:12px;">
                <span>Rendah</span><span>Sedang</span><span>Tinggi</span></div></div>""",
                unsafe_allow_html=True,
            )
        with col_right:
            st.markdown(
                f"""<div style="background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:22px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h3 style="font-size:18px;">Rekomendasi Hari Ini</h3>
                <span style="font-size:12px;color:#64748b;">{2 if label == "Risiko Sedang" else 1} saran</span></div>
                {_recommendations_html(label)}</div>""",
                unsafe_allow_html=True,
            )
        st.markdown("<div style=\"height:18px\"></div>", unsafe_allow_html=True)
        _metric_cards(inputs, result)
    else:
        st.info("Belum ada data prediksi. Silakan isi kuesioner terlebih dahulu.")
        if st.button("Mulai Kuesioner", type="primary"):
            st.session_state["page"] = "Kuesioner"
            st.rerun()

def _risk_segments(class_id):
    colors = [
        ["#639922", "#639922", "#ef9f27", "#ef9f27", "#d0d0c8", "#d0d0c8"],
        ["#639922", "#639922", "#639922", "#ef9f27", "#ef9f27", "#d0d0c8"],
        ["#639922", "#639922", "#639922", "#639922", "#ef9f27", "#c92a2a"],
    ]
    return colors[class_id]

def page_questionnaire(scaler, model):
    st.title("Kuesioner Gaya Hidup")
    st.caption("Isi data harian untuk mendapatkan hasil prediksi risiko kesehatan.")
    saved = st.session_state.get("last_inputs", DEFAULT_INPUTS)
    with st.form("questionnaire_form"):
        c1, c2 = st.columns(2)
        with c1:
            screen_time = st.slider("Screen time harian (jam)", 0.0, 14.0, saved["daily_screen_time_hours"], 0.1, help="Total penggunaan layar dalam satu hari.")
            phone_before_sleep = st.number_input("Penggunaan HP sebelum tidur (menit)", 0, 120, saved["phone_usage_before_sleep_minutes"], help="Durasi dalam menit.")
            notifications = st.slider("Jumlah notifikasi harian (1-10)", 1, 10, saved["notifications_received_per_day"], 1, help="1 = sangat sedikit, 10 = sangat banyak.")
            caffeine = st.slider("Konsumsi kafein (cangkir/hari)", 0, 4, saved.get("caffeine_intake_cups", 2), 1, help="Jumlah cangkir kopi/teh/minuman berkafein per hari.")
            sleep_duration = st.number_input("Durasi tidur (jam)", 4.0, 9.0, saved["sleep_duration_hours"], 0.1, help="Jumlah jam tidur semalam.")
        with c2:
            sq_opts = ["Segar", "Biasa saja", "Lelah"]
            sleep_quality = st.selectbox("Kondisi bangun tidur", sq_opts, index=sq_opts.index(saved["sleep_quality_score"]), help="Digunakan untuk memperkirakan kualitas tidur.")
            physical_activity = st.slider("Aktivitas fisik harian (menit)", 0, 120, saved["physical_activity_minutes"], 5, help="Durasi olahraga atau aktivitas fisik.")
            st_opts = ["Rendah", "Sedang", "Tinggi"]
            stress_level = st.selectbox("Kondisi stres hari ini", st_opts, index=st_opts.index(saved["stress_level"]), help="Penilaian sederhana berdasarkan kondisi harian.")
            mf_opts = ["Baik", "Cukup", "Buruk"]
            mental_fatigue = st.selectbox("Fokus dan kelelahan mental", mf_opts, index=mf_opts.index(saved["mental_fatigue_score"]), help="Menggambarkan kondisi fokus dan energi mental.")
        st.divider()
        submitted = st.form_submit_button("Lihat Hasil Prediksi", type="primary", use_container_width=True)
    if submitted:
        inputs = {
            "daily_screen_time_hours": screen_time,
            "phone_usage_before_sleep_minutes": phone_before_sleep,
            "sleep_duration_hours": sleep_duration,
            "sleep_quality_score": sleep_quality,
            "physical_activity_minutes": physical_activity,
            "notifications_received_per_day": notifications,
            "caffeine_intake_cups": caffeine,
            "stress_level": stress_level,
            "mental_fatigue_score": mental_fatigue,
        }
        result = predict_risk(scaler, model, inputs)
        st.session_state["last_inputs"] = inputs
        st.session_state["last_result"] = result
        if "history" not in st.session_state:
            st.session_state["history"] = []
        st.session_state["history"].append({
            "timestamp": datetime.now().strftime("%d %b %Y, %H:%M"),
            **result,
        })
        st.success(f"Prediksi selesai! Kategori: **{result["label"]}**")
        st.session_state["page"] = "Hasil Prediksi"
        st.rerun()

def _compute_factor_contributions(inputs):
    sc = inputs.get("daily_screen_time_hours", 5)
    sd = inputs.get("sleep_duration_hours", 7)
    pa = inputs.get("physical_activity_minutes", 30)
    nt = _map_notif(inputs.get("notifications_received_per_day", 5))
    sq = inputs.get("sleep_quality_score", "Biasa saja")
    sl = inputs.get("stress_level", "Sedang")
    mf = inputs.get("mental_fatigue_score", "Cukup")
    ph = inputs.get("phone_usage_before_sleep_minutes", 30)
    cf = inputs.get("caffeine_intake_cups", 2)

    sc_pct = min(100, max(0, (sc / 10) * 100))
    sd_pct = min(100, max(0, (1 - (sd - 4) / 5) * 100))
    pa_pct = min(100, max(0, (1 - pa / 120) * 100))
    nt_pct = min(100, max(0, (nt / 300) * 100))
    ph_pct = min(100, max(0, (ph / 120) * 100))
    sq_val = SLEEP_QUALITY_MAP.get(sq, 5)
    sq_pct = min(100, max(0, (1 - (sq_val - 1) / 9) * 100))
    sl_val = STRESS_MAP.get(sl, 5)
    sl_pct = min(100, max(0, (sl_val / 10) * 100))
    mf_val = FATIGUE_MAP.get(mf, 5)
    mf_pct = min(100, max(0, (mf_val / 10) * 100))
    cf_pct = min(100, max(0, (cf / 4) * 100))

    return [
        ("Screen time berlebih", int(sc_pct)),
        ("HP sebelum tidur", int(ph_pct)),
        ("Kurang tidur", int(sd_pct)),
        ("Kualitas tidur buruk", int(sq_pct)),
        ("Aktivitas fisik rendah", int(pa_pct)),
        ("Notifikasi berlebih", int(nt_pct)),
        ("Stres tinggi", int(sl_pct)),
        ("Kelelahan mental", int(mf_pct)),
        ("Konsumsi kafein", int(cf_pct)),
    ]

def page_result():
    st.title("Hasil Prediksi")
    st.caption("Lihat kategori risiko, skor, faktor dominan, dan riwayat prediksi.")
    result = st.session_state.get("last_result")
    inputs = st.session_state.get("last_inputs")
    if not result:
        st.info("Belum ada hasil prediksi. Silakan isi kuesioner terlebih dahulu.")
        if st.button("Isi Kuesioner", type="primary"):
            st.session_state["page"] = "Kuesioner"
            st.rerun()
        return
    label = result["label"]
    color = COLOR_MAP[label]
    bg = COLOR_BG[label]
    prob = result["probabilities"]
    conf = result["confidence"]
    c_left, c_right = st.columns([0.85, 1.15])
    with c_left:
        st.markdown(
            f"""<div style="text-align:center;background:{bg};border:1px solid {color};border-radius:22px;padding:22px;">
            <span style="background:{bg};color:{color};border:1px solid {color};padding:7px 13px;border-radius:999px;font-size:12px;font-weight:700;">{label}</span>
            <div style="font-size:72px;font-weight:800;color:{color};margin:12px 0 4px;">{int(conf * 100)}<small style="font-size:24px;font-weight:600;">/100</small></div>
            <p style="color:{color};line-height:1.6;font-size:14px;">{_risk_description(label)}</p>
            <div style="margin-top:16px;font-size:13px;color:#64748b;">
            <div>Rendah: {prob["Risiko Rendah"]:.1%}</div>
            <div>Sedang: {prob["Risiko Sedang"]:.1%}</div>
            <div>Tinggi: {prob["Risiko Tinggi"]:.1%}</div>
            </div></div>""",
            unsafe_allow_html=True,
        )
    with c_right:
        st.markdown(
            """<div style="background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:22px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
            <h3 style="font-size:18px;">Kontribusi Faktor Risiko</h3>
            <span style="font-size:12px;color:#64748b;">Model prediction insight</span></div>""",
            unsafe_allow_html=True,
        )
        if inputs:
            factors = _compute_factor_contributions(inputs)
            factors.sort(key=lambda x: x[1], reverse=True)
            for name, val in factors[:5]:
                bar_color = "#ef9f27" if val > 50 else "#639922"
                st.markdown(
                    f"""<div style="display:grid;grid-template-columns:1fr 260px 44px;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid #e2e8f0;font-size:14px;">
                    <strong>{name}</strong>
                    <div style="height:10px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
                    <div style="height:100%;width:{val}%;background:{bar_color};border-radius:999px;"></div></div>
                    <span>{val}%</span></div>""",
                    unsafe_allow_html=True,
                )
        st.markdown("</div>", unsafe_allow_html=True)
    st.divider()
    st.subheader("Riwayat Prediksi")
    history = st.session_state.get("history", [])
    if history:
        df = pd.DataFrame(history)
        df["confidence"] = df["confidence"].apply(lambda x: f"{x:.1%}")
        df = df.rename(columns={"timestamp": "Tanggal", "label": "Kategori", "confidence": "Keyakinan"})
        st.dataframe(df[["Tanggal", "Kategori", "Keyakinan"]], use_container_width=True, hide_index=True)
    else:
        st.caption("Belum ada riwayat.")

def page_profile():
    st.title("Profil Pengguna")
    st.caption("Kelola data pribadi, target kesehatan, dan pengaturan aplikasi.")
    col_left, col_right = st.columns([0.8, 1.2])
    with col_left:
        st.markdown(
            """<div style="text-align:center;background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:22px;">
            <div style="width:86px;height:86px;margin:0 auto 14px;border-radius:50%;background:#e6f1fb;color:#0c447c;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;">AN</div>
            <h3 style="font-size:20px;margin-bottom:4px;">Andi Nugroho</h3>
            <p style="color:#64748b;font-size:14px;margin-bottom:14px;">andi@email.com \u00b7 24 tahun</p>
            </div>""",
            unsafe_allow_html=True,
        )
    with col_right:
        st.markdown(
            """<div style="background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:22px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
            <h3 style="font-size:18px;">Pengaturan Akun</h3>
            <span style="font-size:12px;color:#64748b;">Preferensi aplikasi</span></div>""",
            unsafe_allow_html=True,
        )
        settings = [
            ("\U0001f464", "#e6f1fb", "#185fa5", "Data pribadi", "\u203a"),
            ("\U0001f3af", "#eaf3de", "#3b6d11", "Target kesehatan", "\u203a"),
            ("\U0001f514", "#eeedfe", "#534ab7", "Notifikasi pengingat", "Aktif"),
            ("\U0001f4bb", "#faeeda", "#854f0b", "Batas screen time", "5 jam"),
        ]
        for icon, ic_bg, ic_color, name, value in settings:
            st.markdown(
                f"""<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:36px;height:36px;border-radius:12px;background:{ic_bg};color:{ic_color};display:flex;align-items:center;justify-content:center;font-weight:700;">{icon}</div>
                <strong style="font-size:14px;">{name}</strong></div>
                <span style="color:#94a3b8;">{value}</span></div>""",
                unsafe_allow_html=True,
            )
        st.markdown("</div>", unsafe_allow_html=True)

def main():
    scaler, model = get_model()
    sidebar_nav()
    page = st.session_state.get("page", "Dashboard")
    if page == "Dashboard":
        page_dashboard(scaler, model)
    elif page == "Kuesioner":
        page_questionnaire(scaler, model)
    elif page == "Hasil Prediksi":
        page_result()
    elif page == "Profil":
        page_profile()

if __name__ == "__main__":
    main()
