import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoatlas from '../assets/logoatlas.png'
import { resolvePhotoUrl } from '../utils/ktaImageGenerator'

/**
 * Komponen Navbar Terpadu & Seragam ATLAS
 * Digunakan di seluruh halaman publik maupun terproteksi (Landing Page, OPAC, Detail Buku, Profile, Dashboard)
 */
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Cek otentikasi
  const token = typeof window !== 'undefined' ? localStorage.getItem('atlas_token') : null
  const isAuthenticated = Boolean(user || token)

  const rawPhoto = user?.photo_url || user?.photo_path || user?.avatar || null
  const userPhoto = resolvePhotoUrl(rawPhoto)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const isHomeActive = location.pathname === '/' || location.pathname === '/landing'
  const isOpacActive =
    location.pathname.startsWith('/opac') ||
    location.pathname.startsWith('/katalog') ||
    location.pathname.startsWith('/books') ||
    location.pathname.startsWith('/buku') ||
    location.pathname.startsWith('/detail-buku')
  const isProfileActive = location.pathname.startsWith('/profile') || location.pathname.startsWith('/profil')

  return (
    <header className="bg-[#00255c] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Top-Left Logo Container */}
        <div
          className="bg-white rounded-2xl px-4 py-2 flex items-center shadow-md cursor-pointer hover:opacity-95 transition-all"
          onClick={() => navigate('/')}
        >
          <img src={logoatlas} alt="ATLAS Logo" className="h-9 sm:h-10 object-contain" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <button
            onClick={() => navigate('/')}
            className={`cursor-pointer transition-colors ${isHomeActive
              ? 'text-white font-bold pb-1 border-b-2 border-white'
              : 'text-white/80 hover:text-white'
              }`}
          >
            Beranda
          </button>

          <button
            onClick={() => navigate('/opac')}
            className={`cursor-pointer transition-colors ${isOpacActive
              ? 'text-white font-bold pb-1 border-b-2 border-white'
              : 'text-white/80 hover:text-white'
              }`}
          >
            OPAC / Katalog
          </button>

          {/* Layanan Mandiri Dropdown */}
          <div className="relative group cursor-pointer flex items-center gap-1 text-white/80 hover:text-white transition-colors">
            <span>Layanan Mandiri</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* User Account Pill Button */}
          {isAuthenticated ? (
            <div className="relative group">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className={`bg-white hover:bg-slate-100 text-[#002B66] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${isProfileActive ? 'ring-2 ring-blue-300' : ''
                  }`}
                title="Lihat Profil Anggota"
              >
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={user?.name || 'User'}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                )}
                <span className="max-w-[130px] truncate">
                  {user?.name ? user.name.split(' ')[0] : 'Profile'}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-slate-100 text-[#002B66] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <span>Login</span>
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="bg-white text-[#002B66] p-2 rounded-full shadow-md"
              title="Profil"
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={user?.name || 'User'}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-white text-[#002B66] px-3 py-1.5 rounded-full text-xs font-bold"
            >
              Login
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001D48] border-t border-white/10 px-4 py-4 space-y-3 text-sm">
          <button
            type="button"
            onClick={() => {
              navigate('/')
              setMobileMenuOpen(false)
            }}
            className={`w-full text-left py-2 px-3 rounded-lg ${isHomeActive ? 'bg-white/10 font-bold text-white' : 'text-slate-300'
              }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/opac')
              setMobileMenuOpen(false)
            }}
            className={`w-full text-left py-2 px-3 rounded-lg ${isOpacActive ? 'bg-white/10 font-bold text-white' : 'text-slate-300'
              }`}
          >
            OPAC / Katalog
          </button>

          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => {
                  navigate('/profile')
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${isProfileActive ? 'bg-white/10 font-bold text-white' : 'text-slate-300'
                  }`}
              >
                <span>Profil & KTA Digital</span>
                <span className="text-xs font-mono opacity-70">{user?.name ? user.name.split(' ')[0] : ''}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 rounded-lg text-rose-400 font-semibold"
              >
                Keluar (Logout)
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate('/login')
                setMobileMenuOpen(false)
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-emerald-400 font-semibold"
            >
              Masuk / Login
            </button>
          )}
        </div>
      )}
    </header>
  )
}
