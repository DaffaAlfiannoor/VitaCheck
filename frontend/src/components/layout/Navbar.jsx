import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/predict', label: 'Cek Risiko' },
]

const authedLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'Riwayat' },
  { to: '/profile', label: 'Profil' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const navClass = (path) =>
    `text-sm font-medium transition-colors ${pathname === path ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              V
            </div>
            VitaCheck
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={navClass(l.to)}>
                {l.label}
              </Link>
            ))}
            {user && authedLinks.map((l) => (
              <Link key={l.to} to={l.to} className={navClass(l.to)}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-600">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
