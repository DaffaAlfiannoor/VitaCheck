import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHistory } from '../api/prediction'
import { useAuth } from '../context/AuthContext'
import RiskBadge from '../components/ui/RiskBadge'
import MetricCard from '../components/ui/MetricCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const latest = history.length > 0 ? history[0] : null
  const score = latest?.risk_score ?? 0
  const label = latest?.risk_label || 'Belum ada data'

  const riskColor = label === 'Risiko Tinggi' ? 'bg-red-500' : label === 'Risiko Sedang' ? 'bg-amber-500' : 'bg-green-500'

  const getScoreMessage = () => {
    if (!latest) return 'Belum melakukan prediksi'
    if (score > 66) return 'Pola gaya hidupmu menunjukkan beberapa faktor risiko tinggi yang perlu segera diperhatikan.'
    if (score > 33) return 'Pola gaya hidupmu memiliki beberapa faktor risiko yang perlu diperbaiki.'
    return 'Pola gaya hidupmu cukup baik. Pertahankan kebiasaan sehatmu!'
  }

  const getSleepBadge = (hours) => {
    if (hours < 6) return { badge: 'Kurang', barWidth: Math.round((hours / 10) * 100), barColor: 'bg-red-500' }
    if (hours < 7) return { badge: 'Cukup', barWidth: Math.round((hours / 10) * 100), barColor: 'bg-amber-500' }
    return { badge: 'Baik', barWidth: Math.round((hours / 10) * 100), barColor: 'bg-green-500' }
  }

  const getScreenBadge = (hours) => {
    if (hours > 8) return { badge: 'Tinggi', barWidth: Math.round((hours / 14) * 100), barColor: 'bg-red-500' }
    if (hours > 5) return { badge: 'Sedang', barWidth: Math.round((hours / 14) * 100), barColor: 'bg-amber-500' }
    return { badge: 'Rendah', barWidth: Math.round((hours / 14) * 100), barColor: 'bg-green-500' }
  }

  const getActivityBadge = (mins) => {
    if (mins < 20) return { badge: 'Kurang', barWidth: Math.round((mins / 120) * 100), barColor: 'bg-red-500' }
    if (mins < 45) return { badge: 'Cukup', barWidth: Math.round((mins / 120) * 100), barColor: 'bg-amber-500' }
    return { badge: 'Baik', barWidth: Math.round((mins / 120) * 100), barColor: 'bg-green-500' }
  }

  const getStressBadge = (level) => {
    if (level > 7) return { badge: 'Tinggi', barWidth: level * 10, barColor: 'bg-red-500' }
    if (level > 4) return { badge: 'Sedang', barWidth: level * 10, barColor: 'bg-amber-500' }
    return { badge: 'Rendah', barWidth: level * 10, barColor: 'bg-green-500' }
  }

  const recentFive = history.slice(0, 5)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr + 'Z')
    const now = new Date()
    const diff = now - d
    const oneDay = 86400000
    if (diff < oneDay) return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    if (diff < 2 * oneDay) return `Kemarin, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    if (diff < 7 * oneDay) return `${Math.floor(diff / oneDay)} hari lalu`
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat datang, {user?.username || 'Pengguna'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan risiko kesehatanmu</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : latest ? (
        <>
          {/* Hero Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <RiskBadge label={label} />
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className={`text-5xl font-extrabold ${riskColor.replace('bg-', 'text-')}`}>
                    {score}
                  </span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{getScoreMessage()}</p>
              </div>
              <div className="w-full sm:w-48">
                <div className="text-xs text-slate-400 mb-2">Tingkat Risiko</div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${riskColor}`} style={{ width: `${score}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Rendah</span>
                  <span>Sedang</span>
                  <span>Tinggi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards - from latest prediction data */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
              value={`${latest.sleep_duration_hours} jam`}
              label="Tidur semalam"
              {...getSleepBadge(latest.sleep_duration_hours)}
            />
            <MetricCard
              icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              value={`${latest.daily_screen_time_hours} jam`}
              label="Screen time"
              {...getScreenBadge(latest.daily_screen_time_hours)}
            />
            <MetricCard
              icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              value={`${latest.physical_activity_minutes} mnt`}
              label="Aktivitas fisik"
              {...getActivityBadge(latest.physical_activity_minutes)}
            />
            <MetricCard
              icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              value={`${latest.stress_level}/10`}
              label="Tingkat stres"
              {...getStressBadge(latest.stress_level)}
            />
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm mb-6">
          <div className="flex justify-center mb-4">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Belum ada data prediksi</h2>
          <p className="text-sm text-slate-500 mb-4">Lakukan prediksi terlebih dahulu untuk melihat ringkasan</p>
          <Link
            to="/predict"
            className="inline-flex px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-indigo-400 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Cek Risiko Sekarang
          </Link>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Riwayat Prediksi</h2>
          {history.length > 5 && (
            <Link to="/history" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              Lihat Semua →
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="text-left px-6 py-3 font-medium">Tanggal</th>
                <th className="text-left px-6 py-3 font-medium">Kategori</th>
                <th className="text-left px-6 py-3 font-medium">Skor</th>
              </tr>
            </thead>
            <tbody>
              {recentFive.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Belum ada riwayat prediksi
                  </td>
                </tr>
              ) : (
                recentFive.map((r) => {
                  const dotColor = r.risk_label === 'Risiko Tinggi' ? 'bg-red-500' : r.risk_label === 'Risiko Sedang' ? 'bg-amber-500' : 'bg-green-500'
                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-slate-600">{formatDate(r.created_at)}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                          <span className="text-slate-700">{r.risk_label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{r.risk_score}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
