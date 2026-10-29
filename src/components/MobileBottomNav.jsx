import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  LayoutGrid,
  User,
  HelpCircle,
  X,
  BookMarked,
  RotateCcw,
  Star,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LAYANAN_MANDIRI_ITEMS, useLayananMandiri } from './layananMandiriItems'
import logo from '../assets/Logo.png'

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { open: openLayanan } = useLayananMandiri()

  // State pop up Layanan Mandiri
  const [isLayananOpen, setIsLayananOpen] = useState(false)

  // Authentication check
  const token = typeof window !== 'undefined' ? localStorage.getItem('atlas_token') : null
  const isAuthenticated = Boolean(user || token)

  // Route active states
  const isHomeActive = location.pathname === '/' || location.pathname === '/landing'
  const isOpacActive =
    location.pathname.startsWith('/opac') ||
    location.pathname.startsWith('/katalog') ||
    location.pathname.startsWith('/books') ||
    location.pathname.startsWith('/buku') ||
    location.pathname.startsWith('/detail-buku')
  const isProfileActive =
    location.pathname.startsWith('/profile') || location.pathname.startsWith('/profil')
  const isPanduanActive = location.pathname.startsWith('/panduan')

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FLOATING BOTTOM NAVIGATION DOCK (MOBILE ONLY)          */}
      {/* ========================================================= */}
      <div className="fixed bottom-4 inset-x-0 mx-auto w-[92%] max-w-[400px] z-50 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <nav
          aria-label="Navigasi Bawah Ponsel"
          className="bg-white rounded-[32px] shadow-[0_12px_36px_rgba(0,35,92,0.16)] border border-slate-100/90 px-2 py-1.5 flex items-center justify-between"
        >
          {/* Tab 1: Beranda */}
          <button
            type="button"
            onClick={() => {
              setIsLayananOpen(false)
              navigate('/')
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isHomeActive && !isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Home className={`w-5 h-5 ${isHomeActive && !isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isHomeActive && !isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Beranda
            </span>
          </button>

          {/* Tab 2: Layanan (Membuka Pop-up Layanan Mandiri) */}
          <button
            type="button"
            onClick={() => setIsLayananOpen(!isLayananOpen)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <LayoutGrid className={`w-5 h-5 ${isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Layanan
            </span>
          </button>

          {/* Tab 3: OPAC (Tombol Lingkaran Menonjol di Tengah - Fitur Utama) */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <button
              type="button"
              onClick={() => {
                setIsLayananOpen(false)
                navigate('/opac')
              }}
              className="relative -top-6 flex flex-col items-center cursor-pointer group"
              title="Katalog OPAC"
            >
              <div
                className={`w-16 h-16 rounded-full bg-white flex items-center justify-center border-[3.5px] ${isOpacActive
                  ? 'border-[#0A2567] shadow-[0_10px_25px_rgba(10,37,103,0.25)] ring-2 ring-[#0A2567]/15'
                  : 'border-slate-100 shadow-[0_10px_25px_rgba(0,35,92,0.18)]'
                  } transition-all duration-200 group-active:scale-95`}
              >
                <img
                  src={logo}
                  alt="Logo OPAC"
                  className="w-8 h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>
              <span
                className={`text-[11px] leading-tight mt-1.5 ${isOpacActive ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                  }`}
              >
                OPAC
              </span>
            </button>
          </div>

          {/* Tab 4: Profil */}
          <button
            type="button"
            onClick={() => {
              setIsLayananOpen(false)
              navigate(isAuthenticated ? '/profile' : '/login')
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isProfileActive && !isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <User className={`w-5 h-5 ${isProfileActive && !isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isProfileActive && !isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Profil
            </span>
          </button>

          {/* Tab 5: Panduan */}
          <button
            type="button"
            onClick={() => {
              setIsLayananOpen(false)
              navigate('/panduan')
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPanduanActive && !isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <HelpCircle className={`w-5 h-5 ${isPanduanActive && !isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isPanduanActive && !isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Panduan
            </span>
          </button>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* 2. POP UP PILIHAN LAYANAN MANDIRI                         */}
      {/* ========================================================= */}
      {isLayananOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-3 pb-24 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsLayananOpen(false)}
        >
          <div
            className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-250 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar & Header */}
            <div>
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00255c] flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2256]">Layanan Mandiri</h3>
                    <p className="text-[11px] text-slate-500">Pilih layanan digital yang ingin Anda akses</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLayananOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Pilihan Layanan */}
            <div className="space-y-2.5 pt-1">
              {/* Opsi 1: Reservasi Saya */}
              <button
                type="button"
                onClick={() => {
                  setIsLayananOpen(false)
                  navigate('/reservasi-saya')
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition-all text-left cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookMarked className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2256] group-hover:text-blue-700 transition-colors">
                      Reservasi Saya
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Pantau status & kode reservasi buku Anda
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Opsi 2: Pinjaman Saya */}
              <button
                type="button"
                onClick={() => {
                  setIsLayananOpen(false)
                  navigate('/pinjaman-saya')
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition-all text-left cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2256] group-hover:text-emerald-700 transition-colors">
                      Pinjaman Saya
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Cek batas waktu pengembalian & denda pinjaman buku
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Opsi 3: Buku Favorit */}
              <button
                type="button"
                onClick={() => {
                  setIsLayananOpen(false)
                  openLayanan(LAYANAN_MANDIRI_ITEMS.find((item) => item.key === 'favorit'))
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 transition-all text-left cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Star className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2256] group-hover:text-amber-700 transition-colors">
                      Buku Favorit
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Koleksi yang Anda tandai bintang
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </button>

            </div>
          </div>
        </div>
      )}

    </>
  )
}
