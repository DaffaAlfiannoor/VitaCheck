import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getHistory } from '../api/prediction'
import { changePassword, updateHealthTarget } from '../api/auth'

export default function Profile() {
  const { user, login, logout, updateTarget } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Change password state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(null)

  // Health Target state
  const [targetVal, setTargetVal] = useState(user?.health_target || '')
  const [targetLoading, setTargetLoading] = useState(false)
  const [targetSuccess, setTargetSuccess] = useState(false)

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSaveTarget = async (e) => {
    e.preventDefault()
    setTargetLoading(true)
    setTargetSuccess(false)
    try {
      await updateHealthTarget(targetVal)
      updateTarget(targetVal)
      setTargetSuccess(true)
      setTimeout(() => setTargetSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setTargetLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(null)

    if (newPw.length < 6) {
      setPwError('Password baru minimal 6 karakter')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('Konfirmasi password tidak cocok')
      return
    }

    setPwLoading(true)
    try {
      const data = await changePassword(currentPw, newPw)
      setPwSuccess(data.message)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      const detail = err.response?.data?.detail
      setPwError(
        typeof detail === 'string' ? detail : 'Terjadi kesalahan. Silakan coba lagi.'
      )
    } finally {
      setPwLoading(false)
    }
  }

  const latest = history.length > 0 ? history[0] : null
  const riskLabel = latest?.risk_label || 'Belum ada riwayat'
  
  const getBadgeColor = (risk) => {
    if (risk === 'Risiko Tinggi') return 'bg-red-50 text-red-700 border-red-200'
    if (risk === 'Risiko Sedang') return 'bg-amber-50 text-amber-700 border-amber-200'
    if (risk === 'Risiko Rendah') return 'bg-green-50 text-green-700 border-green-200'
    return 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const getDotColor = (risk) => {
    if (risk === 'Risiko Tinggi') return 'bg-red-500'
    if (risk === 'Risiko Sedang') return 'bg-amber-500'
    if (risk === 'Risiko Rendah') return 'bg-green-500'
    return 'bg-slate-400'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Calculate stats
  let avgScore = 0
  let frequentFactor = '-'
  if (history.length > 0) {
    avgScore = Math.round(history.reduce((acc, curr) => acc + curr.risk_score, 0) / history.length)
    
    const factorCounts = {}
    history.forEach(r => {
      if (r.sleep_duration_hours < 6) factorCounts['Kurang Tidur'] = (factorCounts['Kurang Tidur'] || 0) + 1
      if (r.daily_screen_time_hours > 8) factorCounts['Screen Time Tinggi'] = (factorCounts['Screen Time Tinggi'] || 0) + 1
      if (r.stress_level > 7) factorCounts['Stres Tinggi'] = (factorCounts['Stres Tinggi'] || 0) + 1
      if (r.phone_usage_before_sleep_minutes > 60) factorCounts['HP Sblm Tidur'] = (factorCounts['HP Sblm Tidur'] || 0) + 1
      if (r.mental_fatigue_score > 7) factorCounts['Kelelahan Mental'] = (factorCounts['Kelelahan Mental'] || 0) + 1
    })

    if (Object.keys(factorCounts).length > 0) {
      frequentFactor = Object.keys(factorCounts).reduce((a, b) => factorCounts[a] > factorCounts[b] ? a : b)
    } else {
      frequentFactor = 'Tidak Ada'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profil Saya</h1>

      <div className="grid sm:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
        {/* Avatar & User Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{user?.username || 'Pengguna'}</h3>
          <p className="text-sm text-slate-500 mb-4">{user?.email || '-'}</p>
          
          <div className="w-full h-px bg-slate-100 my-4" />
          
          <div className="text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Status Risiko Saat Ini</span>
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
              ) : (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getBadgeColor(riskLabel)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(riskLabel)}`} />
                  {riskLabel}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Bergabung Sejak</span>
              <span className="text-xs font-semibold text-slate-700">{formatDate(user?.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Health Target */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Target Kesehatan</h3>
              {targetSuccess && <span className="text-xs text-green-600 font-semibold">Tersimpan!</span>}
            </div>
            <form onSubmit={handleSaveTarget} className="flex gap-2">
              <select 
                value={targetVal}
                onChange={e => setTargetVal(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="">-- Belum ada target --</option>
                <option value="Kurangi Screen Time">Kurangi Screen Time</option>
                <option value="Perbaiki Kualitas Tidur">Perbaiki Kualitas Tidur</option>
                <option value="Tingkatkan Aktivitas Fisik">Tingkatkan Aktivitas Fisik</option>
                <option value="Kelola Stres Lebih Baik">Kelola Stres Lebih Baik</option>
                <option value="Kurangi Kafein">Kurangi Konsumsi Kafein</option>
              </select>
              <button
                type="submit"
                disabled={targetLoading || targetVal === (user?.health_target || '')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {targetLoading ? '...' : 'Simpan'}
              </button>
            </form>
          </div>

          {/* Account Details & Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Statistik Rata-rata</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 mb-2 text-indigo-500 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div className="text-xs text-slate-500 mb-1">Skor Rata-rata</div>
                <div className="text-xl font-bold text-slate-800">
                  {loading ? '-' : history.length > 0 ? avgScore : '-'}
                </div>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 mb-2 text-amber-500 bg-amber-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div className="text-xs text-slate-500 mb-1">Faktor Dominan</div>
                <div className="text-sm font-bold text-slate-800">
                  {loading ? '-' : frequentFactor}
                </div>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 mb-4">Informasi Akun</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Username</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{user?.username}</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Email</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Ubah Password</h3>

            {pwError && (
              <p className="mb-4 text-sm text-red-600">{pwError}</p>
            )}
            {pwSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                {pwSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Lama</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Masukkan password lama"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-3 bg-gradient-to-br from-indigo-500 to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60 transition-all"
              >
                {pwLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  'Simpan Password Baru'
                )}
              </button>
            </form>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  )
}
