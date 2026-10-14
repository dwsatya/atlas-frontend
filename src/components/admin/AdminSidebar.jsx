import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ShieldAlert,
  Users,
  AlertTriangle,
  ArrowUpRight,
  CornerDownLeft,
  ClipboardList,
  KeyRound,
  ClipboardCheck,
  BarChart3,
  Settings,
  X,
  ChevronRight,
} from 'lucide-react'

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation()

  const currentPath = location.pathname

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        {
          name: 'Dashboard / Beranda',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'PENGELOLAAN KOLEKSI',
      items: [
        {
          name: 'Entri Katalog',
          path: '/admin/entri-katalog',
          icon: BookOpen,
          exact: true,
        },
        {
          name: 'Daftar Koleksi & Eksemplar',
          path: '/admin/koleksi',
          icon: Library,
        },
        {
          name: 'Karantina Koleksi',
          path: '/admin/karantina',
          icon: ShieldAlert,
        },
      ],
    },
    {
      title: 'KEANGGOTAAN',
      items: [
        {
          name: 'Entri Anggota',
          path: '/form-data-diri',
          icon: Users,
        },
        {
          name: 'Keranjang Bermasalah',
          path: '/admin/keranjang-bermasalah',
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: 'LAYANAN SIRKULASI',
      items: [
        {
          name: 'Peminjaman',
          path: '/admin/sirkulasi/peminjaman',
          icon: ArrowUpRight,
        },
        {
          name: 'Pengembalian',
          path: '/admin/sirkulasi/pengembalian',
          icon: CornerDownLeft,
        },
        {
          name: 'Daftar Peminjaman',
          path: '/admin/sirkulasi/daftar',
          icon: ClipboardList,
        },
      ],
    },
    {
      title: 'LAYANAN RUANG BACA',
      items: [
        {
          name: 'Peminjaman Loker',
          path: '/admin/loker',
          icon: KeyRound,
        },
        {
          name: 'Buku Tamu / Presensi',
          path: '/admin/presensi',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: 'PELAPORAN & KONFIGURASI',
      items: [
        {
          name: 'Laporan & Statistik',
          path: '/admin/laporan',
          icon: BarChart3,
        },
        {
          name: 'Pengaturan & Hak Akses',
          path: '/admin/pengaturan',
          icon: Settings,
        },
      ],
    },
  ]

  const isActive = (itemPath) => {
    if (itemPath === '/admin/entri-katalog') {
      return (
        currentPath === '/admin/entri-katalog' ||
        currentPath === '/admin/katalog' ||
        currentPath === '/entri-katalog'
      )
    }
    return currentPath === itemPath
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#071739] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#0e275c] lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-[#0f2a63] flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            {/* Geometric Diamond Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00A389] via-[#0084FF] to-[#6366F1] flex items-center justify-center p-2 shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full text-white"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" fill="white" fillOpacity="0.25" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-[13px] font-extrabold tracking-tight text-white leading-tight">
                ATLAS V1.0 | DAPD Kab. Buleleng
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-normal tracking-wide">
                Aplikasi Terpadu Layanan Arsip &amp; Sirkulasi
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menus (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold tracking-wider text-slate-400/90 uppercase">
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item, iIdx) => {
                  const active = isActive(item.path)
                  const Icon = item.icon

                  return (
                    <Link
                      key={iIdx}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose()
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        active
                          ? 'bg-white text-[#071739] font-bold shadow-md shadow-black/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active
                            ? 'text-[#071739]'
                            : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate flex-1">{item.name}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A389]" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Brand / Version */}
        <div className="p-3.5 border-t border-[#0f2a63] bg-[#05112b] text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">Server Aktif</span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
            v1.0.4-prod
          </span>
        </div>
      </aside>
    </>
  )
}
