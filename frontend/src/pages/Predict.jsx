import { useState, useCallback } from 'react'
import { predict } from '../api/prediction'
import SliderField from '../components/ui/SliderField'
import SelectField from '../components/ui/SelectField'
import RiskBadge from '../components/ui/RiskBadge'
import FactorBar from '../components/ui/FactorBar'

const notificationOptions = Array.from({ length: 30 }, (_, i) => {
  const start = i * 10 + 1;
  const end = (i + 1) * 10;
  return { label: `${start}-${end}`, value: Math.round((start + end) / 2) };
});

const defaults = {
  daily_screen_time_hours: 7.4,
  phone_usage_before_sleep_minutes: 52,
  sleep_duration_hours: 5.8,
  sleep_quality_score: 5,
  physical_activity_minutes: 18,
  notifications_received_per_day: 146,
  caffeine_intake_cups: 2,
  stress_level: 7,
  mental_fatigue_score: 6,
}

export default function Predict() {
  const [form, setForm] = useState({ ...defaults })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = useCallback((key) => (val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await predict(form)
      setResult(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Gagal mendapatkan prediksi'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const label = result?.prediction?.label || ''
  const probabilities = result?.probabilities || {}
  
  let score = 0
  if (result) {
    const low = probabilities['Risiko Rendah'] || 0
    const med = probabilities['Risiko Sedang'] || 0
    const high = probabilities['Risiko Tinggi'] || 0
    score = Math.round((low * 0) + (med * 50) + (high * 100))
  }
  const isHighRisk = label === 'Risiko Tinggi'

  const factorItems = [
    { name: 'Durasi tidur', pct: form.sleep_duration_hours < 6 ? 84 : form.sleep_duration_hours < 7 ? 65 : 30, color: form.sleep_duration_hours < 6 ? 'high' : form.sleep_duration_hours < 7 ? 'mid' : 'low' },
    { name: 'HP sebelum tidur', pct: form.phone_usage_before_sleep_minutes > 60 ? 78 : form.phone_usage_before_sleep_minutes > 30 ? 55 : 25, color: form.phone_usage_before_sleep_minutes > 60 ? 'high' : 'mid' },
    { name: 'Screen time', pct: form.daily_screen_time_hours > 8 ? 82 : form.daily_screen_time_hours > 5 ? 60 : 30, color: form.daily_screen_time_hours > 8 ? 'high' : 'mid' },
    { name: 'Tingkat stres', pct: form.stress_level > 7 ? 75 : form.stress_level > 4 ? 50 : 20, color: form.stress_level > 7 ? 'high' : 'mid' },
  ]

  const fieldGroups = [
    {
      title: 'Layar & Notifikasi',
      fields: [
        { key: 'daily_screen_time_hours', label: 'Screen time harian', min: 0, max: 14, step: 0.1, unit: 'jam', minLabel: '0 jam', maxLabel: '14 jam' },
        { key: 'phone_usage_before_sleep_minutes', label: 'HP sebelum tidur', min: 0, max: 120, unit: 'mnt', minLabel: '0 mnt', maxLabel: '120 mnt' },
        { key: 'notifications_received_per_day', label: 'Notifikasi per hari', type: 'select', options: notificationOptions },
      ],
    },
    {
      title: 'Tidur & Aktivitas',
      fields: [
        { key: 'sleep_duration_hours', label: 'Durasi tidur', min: 4, max: 9, step: 0.1, unit: 'jam', minLabel: '4 jam', maxLabel: '9 jam' },
        { key: 'sleep_quality_score', label: 'Kualitas tidur', min: 1, max: 10, minLabel: '1 (buruk)', maxLabel: '10 (baik)' },
        { key: 'physical_activity_minutes', label: 'Aktivitas fisik', min: 0, max: 120, unit: 'mnt', minLabel: '0 mnt', maxLabel: '120 mnt' },
      ],
    },
    {
      title: 'Mental & Konsumsi',
      fields: [
        { key: 'stress_level', label: 'Tingkat stres', min: 1, max: 10, minLabel: '1 (rendah)', maxLabel: '10 (tinggi)' },
        { key: 'mental_fatigue_score', label: 'Kelelahan mental', min: 1, max: 10, minLabel: '1 (segar)', maxLabel: '10 (lelah)' },
        { key: 'caffeine_intake_cups', label: 'Kafein (cangkir)', min: 0, max: 4, minLabel: '0', maxLabel: '4 cangkir' },
      ],
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full mb-4">
          Modul Prediksi
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Cek Risiko Kesehatan Digital</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Sembilan variabel gaya hidup digunakan oleh model Machine Learning untuk menghitung skor risiko kesehatan.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
        {/* INPUTS */}
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg text-slate-900">Data Gaya Hidup</h2>
            <span className="text-xs text-slate-400">9 parameter</span>
          </div>

          {fieldGroups.map((group) => (
            <div key={group.title} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                {group.title}
              </div>
              {group.fields.map((f) => {
                if (f.type === 'select') {
                  return (
                    <SelectField
                      key={f.key}
                      label={f.label}
                      value={form[f.key]}
                      onChange={handleChange(f.key)}
                      options={f.options}
                    />
                  )
                }
                return (
                  <SliderField
                    key={f.key}
                    label={f.label}
                    value={form[f.key]}
                    onChange={handleChange(f.key)}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    unit={f.unit}
                    minLabel={f.minLabel}
                    maxLabel={f.maxLabel}
                  />
                )
              })}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-5 py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              'Hitung Risiko Kesehatan'
            )}
          </button>
        </div>

        {/* RESULT */}
        <div className="p-6 sm:p-8 bg-slate-50 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Prediksi</span>
            {result && <RiskBadge label={label} />}
          </div>

          {result ? (
            <>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-5xl font-extrabold bg-gradient-to-br from-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                  {score}
                </span>
                <span className="text-sm text-slate-400">skor risiko (0–100)</span>
              </div>

              <div className="w-full h-1.5 bg-slate-200 rounded-full mb-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    score > 66 ? 'bg-red-500' : score > 33 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-5">
                <span>Rendah</span>
                <span>Sedang</span>
                <span>Tinggi</span>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Faktor Paling Berpengaruh
                </h4>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  {factorItems.map((f) => (
                    <FactorBar key={f.name} {...f} />
                  ))}
                </div>
              </div>

              {result.probabilities && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Distribusi Probabilitas
                  </h4>
                  <div className="flex gap-2">
                    {Object.entries(probabilities).map(([key, val]) => (
                      <div key={key} className="flex-1 text-center p-2 bg-white rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500 mb-1">{key}</div>
                        <div className="text-sm font-bold text-slate-800">{Math.round(val * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Rekomendasi Preventif
                </h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  {isHighRisk ? (
                    <>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-red-500">
                        Segera konsultasi dengan tenaga kesehatan untuk evaluasi lebih lanjut.
                      </li>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-amber-500">
                        Kurangi screen time dan terapkan digital detox secara bertahap.
                      </li>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-green-500">
                        Targetkan tidur 7-9 jam per malam untuk pemulihan optimal.
                      </li>
                    </>
                  ) : score > 33 ? (
                    <>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-amber-500">
                        Kurangi pemakaian HP 30–60 menit sebelum tidur.
                      </li>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-green-500">
                        Targetkan durasi tidur minimal 7 jam per malam.
                      </li>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-green-500">
                        Selingi screen time dengan aktivitas fisik ringan 15–20 menit.
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-green-500">
                        Pertahankan gaya hidup sehat yang sudah kamu jalani.
                      </li>
                      <li className="flex items-start gap-2 before:content-[''] before:w-2 before:h-2 before:mt-1.5 before:shrink-0 before:rounded before:bg-green-500">
                        Tetap batasi screen time untuk menjaga kualitas tidur.
                      </li>
                    </>
                  )}
                </ul>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  Hasil bersifat prediktif berdasarkan pola data, bukan diagnosis medis.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                <p>Isi data gaya hidup di samping</p>
                <p className="text-xs mt-1">lalu klik tombol untuk melihat hasil</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
