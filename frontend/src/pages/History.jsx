import { useState, useEffect } from 'react'
import { getHistory } from '../api/prediction'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts'

const ITEMS_PER_PAGE = 5

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? history : history.filter((r) => {
    const created = new Date(r.created_at + 'Z')
    const now = new Date()
    const diffDays = (now - created) / 86400000
    if (filter === '7') return diffDays <= 7
    if (filter === '30') return diffDays <= 30
    return true
  })

  // Chart data needs to be chronological (oldest to newest)
  const chartData = [...filtered].reverse()

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const dotColor = (risk) =>
    risk === 'Risiko Tinggi' ? 'bg-red-500' : risk === 'Risiko Sedang' ? 'bg-amber-500' : 'bg-green-500'

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr + 'Z')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const getDominantFactors = (r) => {
    const factors = []
    if (r.sleep_duration_hours < 6) factors.push('Tidur')
    if (r.daily_screen_time_hours > 8) factors.push('Screen time')
    if (r.stress_level > 7) factors.push('Stres')
    if (r.phone_usage_before_sleep_minutes > 60) factors.push('HP sebelum tidur')
    if (r.mental_fatigue_score > 7) factors.push('Kelelahan mental')
    return factors.length > 0 ? factors.join(', ') : '-'
  }

  // Custom Dot for Recharts
  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const color = payload.risk_label === 'Risiko Tinggi' ? '#ef4444' // red-500
      : payload.risk_label === 'Risiko Sedang' ? '#f59e0b' // amber-500
      : '#22c55e' // green-500
    
    return (
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
    )
  }

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(data.created_at + 'Z')
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl z-50">
          <p className="text-xs text-slate-500 mb-1">
            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm font-bold text-slate-900 mb-1">
            Skor: <span className={
              data.risk_label === 'Risiko Tinggi' ? 'text-red-600' : 
              data.risk_label === 'Risiko Sedang' ? 'text-amber-600' : 'text-green-600'
            }>{data.risk_score}</span>
          </p>
          <p className="text-xs font-semibold text-slate-700">
            Kategori: {data.risk_label}
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-[200px] break-words">
            Faktor: {getDominantFactors(data)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Prediksi</h1>
          <p className="text-sm text-slate-500 mt-1">Lihat perkembangan risiko kesehatan dari waktu ke waktu</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Semua' },
            { key: '30', label: '30 Hari' },
            { key: '7', label: '7 Hari' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Chart Section */}
          {history.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Tren Risiko Kesehatan</h2>
              
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="created_at" 
                      tickFormatter={(tick) => {
                        const d = new Date(tick + 'Z')
                        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                      }} 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                      minTickGap={20}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      ticks={[0, 33, 66, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    
                    {/* Background color zones for thresholds */}
                    <ReferenceArea y1={0} y2={33} fill="#dcfce7" fillOpacity={0.4} />
                    <ReferenceArea y1={33} y2={66} fill="#fef3c7" fillOpacity={0.4} />
                    <ReferenceArea y1={66} y2={100} fill="#fee2e2" fillOpacity={0.4} />

                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} 
                      isAnimationActive={false}
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="risk_score" 
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={<CustomDot />}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {chartData.length <= 3 && (
                <p className="text-xs text-center text-slate-400 mt-4 italic">
                  * Data akan lebih informatif setelah beberapa prediksi lagi.
                </p>
              )}
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left px-6 py-3.5 font-medium">Tanggal</th>
                    <th className="text-left px-6 py-3.5 font-medium">Kategori</th>
                    <th className="text-left px-6 py-3.5 font-medium">Skor</th>
                    <th className="text-left px-6 py-3.5 font-medium hidden sm:table-cell">Faktor Dominan</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                        Belum ada data riwayat yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paged.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-slate-600 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${dotColor(r.risk_label)}`} />
                            <span className="text-slate-700">{r.risk_label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`font-bold ${r.risk_score > 66 ? 'text-red-600' : r.risk_score > 33 ? 'text-amber-600' : 'text-green-600'}`}>
                            {r.risk_score}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs hidden sm:table-cell">{getDominantFactors(r)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
