import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'

// Disimpan di luar komponen agar bertahan saat remount
let persistedLoginError = null

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setErrorState] = useState(persistedLoginError)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const setError = (msg) => {
    persistedLoginError = msg
    setErrorState(msg)
  }

  // Bersihkan error tersimpan saat meninggalkan halaman
  useEffect(() => {
    return () => { persistedLoginError = null }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginRequest(username, password)
      persistedLoginError = null
      login(data.access_token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      let msg
      if (status === 401) {
        msg = 'Username atau password yang kamu masukkan salah. Silakan coba lagi.'
      } else if (status === 422) {
        msg = 'Mohon isi semua kolom dengan benar.'
      } else {
        msg = Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Terjadi kesalahan. Silakan coba lagi.'
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Masuk</h1>
          <p className="text-sm text-slate-500 mt-2">Masuk untuk mengakses dashboard dan riwayat</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <div className="text-right mt-1.5">
              <Link to="/forgot-password" className="text-xs text-indigo-600 font-semibold hover:text-indigo-700">
                Lupa Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-br from-indigo-500 to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60 transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              'Masuk'
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Belum punya akun?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
