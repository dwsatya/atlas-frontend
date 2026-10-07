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
            className={`cursor-pointer transition-colors ${
              isHomeActive
                ? 'text-white font-bold pb-1 border-b-2 border-white'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => navigate('/opac')}
            className={`cursor-pointer transition-colors ${
              isOpacActive
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

            {/* Menu Popover */}
            <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block transition-all z-50 text-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-[#002B66] cursor-pointer"
              >
                <span>💳</span>
                <span>Kartu Anggota Digital (KTA)</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/opac')}
                className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-[#002B66] cursor-pointer"
              >
                <span>🔍</span>
                <span>Pencarian & Reservasi Buku</span>
              </button>
              <a
                href="https://wa.me/6285753341689"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-[#002B66] cursor-pointer"
              >
                <span>💬</span>
                <span>Bantuan Pustakawan</span>
              </a>
            </div>
          </div>

          {/* User Account Pill Button */}
          {isAuthenticated ? (
            <div className="relative group">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className={`bg-white hover:bg-slate-100 text-[#002B66] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  isProfileActive ? 'ring-2 ring-blue-300' : ''
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
                <svg
                  className="w-3.5 h-3.5 text-slate-500 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu Profil / Logout */}
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 hidden group-hover:block transition-all z-50 text-slate-800">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Anggota ATLAS'}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{user?.member_no || user?.email || '-'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#002B66] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4 text-[#002B66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profil & KTA Digital</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Keluar (Logout)</span>
                </button>
              </div>
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
            className={`w-full text-left py-2 px-3 rounded-lg ${
              isHomeActive ? 'bg-white/10 font-bold text-white' : 'text-slate-300'
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
            className={`w-full text-left py-2 px-3 rounded-lg ${
              isOpacActive ? 'bg-white/10 font-bold text-white' : 'text-slate-300'
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
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between ${
                  isProfileActive ? 'bg-white/10 font-bold text-white' : 'text-slate-300'
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
