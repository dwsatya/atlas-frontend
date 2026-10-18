import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoatlas from '../assets/logoatlas.png'
import { resolvePhotoUrl } from '../utils/ktaImageGenerator'
import MobileBottomNav from './MobileBottomNav'

/**
 * Komponen Navbar Terpadu & Seragam ATLAS
 * Digunakan di seluruh halaman publik maupun terproteksi (Landing Page, OPAC, Detail Buku, Profile, Dashboard)
 */
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  // Cek otentikasi
  const token = typeof window !== 'undefined' ? localStorage.getItem('atlas_token') : null
  const isAuthenticated = Boolean(user || token)

  const rawPhoto = user?.photo_url || user?.photo_path || user?.avatar || null
  const userPhoto = resolvePhotoUrl(rawPhoto)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isHomeActive = location.pathname === '/' || location.pathname === '/landing'
  const isOpacActive =
    location.pathname.startsWith('/opac') ||
    location.pathname.startsWith('/katalog') ||
    location.pathname.startsWith('/books') ||
    location.pathname.startsWith('/buku') ||
    location.pathname.startsWith('/detail-buku')
  const isProfileActive = location.pathname.startsWith('/profile') || location.pathname.startsWith('/profil')
  const isPanduanActive = location.pathname.startsWith('/panduan')

  return (
    <>
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
          <div className="relative group cursor-pointer flex items-center gap-1 text-white/80 hover:text-white transition-colors py-2">
            <span>Layanan Mandiri</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>

            {/* Dropdown Menu on Desktop */}
            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                type="button"
                onClick={() => navigate('/panduan#baca-ditempat')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Baca Ditempat</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/panduan#cek-pengembalian')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Cek Pengembalian</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/panduan#usulan-buku')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>Usulan Pengadaan Buku</span>
              </button>
            </div>
          </div>

          {/* Panduan */}
          <button
            onClick={() => navigate('/panduan')}
            className={`cursor-pointer transition-colors ${isPanduanActive
              ? 'text-white font-bold pb-1 border-b-2 border-white'
              : 'text-white/80 hover:text-white'
              }`}
          >
            Panduan
          </button>

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


      </div>
    </header>

    {/* Mobile Floating Bottom Navigation Dock */}
    <MobileBottomNav />
  </>
  )
}
