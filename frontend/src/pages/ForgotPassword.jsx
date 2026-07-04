import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ForgotPassword() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      const data = await resetPassword(username, email, newPassword)
      setSuccess(data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Terjadi kesalahan. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Lupa Password</h1>
          <p className="text-sm text-slate-500 mt-2">
            Masukkan username dan email untuk mereset password
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm"
        >
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email yang terdaftar"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="w-full h-px bg-slate-100 my-5" />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              required
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
              'Reset Password'
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Sudah ingat password?{' '}
            <Link
              to="/login"
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
