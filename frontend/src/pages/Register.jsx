import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await registerRequest(form.username, form.email, form.password)
      login(data.access_token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : detail || 'Registrasi gagal'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Daftar</h1>
          <p className="text-sm text-slate-500 mt-2">Buat akun untuk menyimpan riwayat prediksi</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={handleChange('username')}
              placeholder="Pilih username"
              required
              minLength={3}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="Masukkan email"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="Buat password (min. 6 karakter)"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
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
              'Daftar'
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
