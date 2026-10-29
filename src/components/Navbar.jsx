import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  CircleHelp,
  House,
  LayoutGrid,
  LibraryBig,
  LogIn,
  LogOut,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/Logo.png'
import { notifyLogoutSuccess } from '../utils/notification'
import MobileBottomNav from './MobileBottomNav'
import { LayananMandiriDropdown } from './LayananMandiri'

// Posisi terakhir pil putih menu aktif. Disimpan di luar komponen karena setiap halaman
// memasang Navbar sendiri, sehingga pil bisa meluncur dari menu sebelumnya ke menu baru.
let lastIndicator = null

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'A'

/**
 * Komponen Navbar Terpadu & Seragam ATLAS
 * Digunakan di seluruh halaman publik maupun terproteksi (Landing Page, OPAC, Detail Buku, Profile, Dashboard)
 */
export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Cek otentikasi
  const token = typeof window !== 'undefined' ? localStorage.getItem('atlas_token') : null
  const isAuthenticated = Boolean(user || token)

  const displayName = user?.name || user?.nama_lengkap || user?.username || 'Anggota'
  const avatarUrl = user?.photo_url || user?.avatar || null

  const confirmLogout = () => {
    setShowLogoutModal(false)
    logout()
    notifyLogoutSuccess(isAdmin)
    navigate(isAdmin ? '/admin/login' : '/')
  }

  // Tutup popup logout dengan tombol Escape
  useEffect(() => {
    if (!showLogoutModal) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowLogoutModal(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showLogoutModal])

  const isHomeActive = location.pathname === '/' || location.pathname === '/landing'
  const isOpacActive =
    (location.pathname.startsWith('/opac') && !location.search.includes('favorit=1')) ||
    location.pathname.startsWith('/katalog') ||
    location.pathname.startsWith('/books') ||
    location.pathname.startsWith('/buku') ||
    location.pathname.startsWith('/detail-buku')
  const isProfileActive = location.pathname.startsWith('/profile') || location.pathname.startsWith('/profil')
  const isPanduanActive = location.pathname.startsWith('/panduan')
  const isLayananActive =
    ['/reservasi-saya', '/pinjaman-saya'].includes(location.pathname) ||
    (location.pathname === '/opac' && location.search.includes('favorit=1'))

  const activeKey = isHomeActive
    ? 'home'
    : isOpacActive
      ? 'opac'
      : isLayananActive
        ? 'layanan'
        : isPanduanActive
          ? 'panduan'
          : null

  // Pil putih animasi yang meluncur ke menu aktif
  const navRef = useRef(null)
  const navItemRefs = useRef({})
  const [indicator, setIndicator] = useState(() => (lastIndicator ? { ...lastIndicator, animate: false } : null))

  useLayoutEffect(() => {
    const measure = () => {
      const el = activeKey ? navItemRefs.current[activeKey] : null
      if (!el || !navRef.current || !el.offsetWidth) return null
      // Ukur relatif terhadap <nav> (tombol Layanan Mandiri berada di dalam pembungkus relative)
      const navRect = navRef.current.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      return { left: rect.left - navRect.left - navRef.current.clientLeft, width: rect.width }
    }

    // Tunggu satu frame agar posisi awal (menu sebelumnya) sempat dirender sebelum meluncur
    const frame = requestAnimationFrame(() => {
      const next = measure()
      setIndicator(next ? { ...next, animate: Boolean(lastIndicator) } : null)
      lastIndicator = next
    })

    const handleResize = () => {
      const next = measure()
      setIndicator(next ? { ...next, animate: false } : null)
      lastIndicator = next
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeKey])

  const setNavItemRef = (key) => (el) => {
    navItemRefs.current[key] = el
  }

  const navLinkClass = (active) =>
    `relative z-10 h-9 px-3.5 rounded-full flex items-center gap-2 text-[13px] transition-colors duration-300 cursor-pointer ${
      active ? 'text-[#00255c] font-bold' : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
    }`

  return (
    <>
      <header className="bg-[#00255c] text-white sticky top-0 z-50 shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Top-Left Logo Container */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="justify-self-start w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/20 cursor-pointer hover:shadow-lg hover:-translate-y-px transition-all"
            aria-label="Beranda ATLAS"
          >
            <img src={logo} alt="Logo ATLAS DAPD Kab. Buleleng" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </button>

          {/* Desktop Navigation Links */}
          <nav ref={navRef} className="relative hidden md:flex justify-self-center items-center gap-1 p-1 rounded-full bg-white/5 ring-1 ring-white/10">
            {/* Pil putih menu aktif (beranimasi saat berpindah menu) */}
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm pointer-events-none"
              style={{
                left: indicator?.left ?? 0,
                width: indicator?.width ?? 0,
                opacity: indicator ? 1 : 0,
                transition: indicator?.animate
                  ? 'left 350ms cubic-bezier(0.22, 1, 0.36, 1), width 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms'
                  : 'opacity 200ms',
              }}
            />

            <button type="button" ref={setNavItemRef('home')} onClick={() => navigate('/')} className={navLinkClass(isHomeActive)}>
              <House className="w-4 h-4 hidden lg:block" />
              Beranda
            </button>

            <button type="button" ref={setNavItemRef('opac')} onClick={() => navigate('/opac')} className={navLinkClass(isOpacActive)}>
              <LibraryBig className="w-4 h-4 hidden lg:block" />
              OPAC / Katalog
            </button>

            {/* Layanan Mandiri Dropdown */}
            <div className="relative group">
              <button type="button" ref={setNavItemRef('layanan')} className={navLinkClass(isLayananActive)} aria-haspopup="true">
                <LayoutGrid className="w-4 h-4 hidden lg:block" />
                Layanan Mandiri
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <LayananMandiriDropdown />
            </div>

            <button type="button" ref={setNavItemRef('panduan')} onClick={() => navigate('/panduan')} className={navLinkClass(isPanduanActive)}>
              <CircleHelp className="w-4 h-4 hidden lg:block" />
              Panduan
            </button>
          </nav>

          {/* Right: Account */}
          <div className="hidden md:flex col-start-3 justify-self-end items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className={`h-11 pl-1.5 pr-3 rounded-full flex items-center gap-2.5 bg-white/10 hover:bg-white/15 ring-1 transition-all cursor-pointer ${
                    isProfileActive ? 'ring-white/60' : 'ring-white/15'
                  }`}
                  title="Akun Saya"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/40" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-white text-[#00255c] text-xs font-extrabold flex items-center justify-center">
                      {getInitials(displayName)}
                    </span>
                  )}
                  <span className="hidden lg:flex flex-col items-start leading-tight text-left">
                    <span className="text-[13px] font-bold max-w-[120px] truncate">{displayName.split(' ')[0]}</span>
                    <span className="text-[10px] text-white/60">{isAdmin ? 'Administrator' : 'Anggota'}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Account Dropdown */}
                <div className="absolute right-0 top-full pt-3 w-60 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                  <div className="bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-[#032360] truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || user?.member_no || (isAdmin ? 'Administrator' : 'Anggota Perpustakaan')}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#032360] transition-colors cursor-pointer"
                      >
                        <UserRound className="w-4 h-4 text-slate-400" />
                        Profil Saya
                      </button>
                    </div>
                    <div className="p-1.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="h-10 px-4 rounded-full text-[13px] font-semibold text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 hidden lg:block" />
                  Daftar
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="h-10 px-5 rounded-full bg-white hover:bg-slate-100 text-[#002B66] text-[13px] font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Popup Overlay Konfirmasi Logout */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight">Yakin ingin Logout?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Sesi akun Anda akan diakhiri. Anda perlu login kembali untuk mengakses layanan anggota ATLAS.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Navigation Dock */}
      <MobileBottomNav />
    </>
  )
}
