import { useState, useEffect } from 'react'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navClass = (path) =>
    `text-sm font-medium transition-colors ${pathname === path ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`

  const sidebarNavClass = (path) =>
    `block px-4 py-3 text-base font-medium transition-colors border-l-4 ${pathname === path ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`

  const closeSidebar = () => setIsSidebarOpen(false)
  
  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isSidebarOpen])

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-10">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-indigo-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 bg-slate-900 rounded text-white transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8l7 8 7-8" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-slate-900">VitaCheck</span>
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

          <div className="hidden md:flex items-center gap-3">
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

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`fixed inset-y-0 left-0 z-60 w-72 bg-white shadow-xl md:hidden flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <Link to="/" onClick={closeSidebar} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 rounded text-white transition-transform group-hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8l7 8 7-8" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">VitaCheck</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 focus:outline-none bg-slate-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="py-4 flex flex-col gap-1 overflow-y-auto">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={closeSidebar} className={sidebarNavClass(l.to)}>
              {l.label}
            </Link>
          ))}
          {user && authedLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={closeSidebar} className={sidebarNavClass(l.to)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 mt-auto bg-white">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-slate-900 truncate">{user.username}</span>
                  <span className="text-xs text-slate-500 truncate">{user.email || 'Pengguna VitaCheck'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout()
                  closeSidebar()
                }}
                className="w-full text-center py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeSidebar}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={closeSidebar}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
