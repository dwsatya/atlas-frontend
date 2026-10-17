import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/Logo.png'
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B2256] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#112d6e] lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-4.5 border-b border-[#122e6e] flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            {/* Logo Image Asset (Tanpa background putih) */}
            <img
              src={logo}
              alt="Logo Perpustakaan ATLAS"
              className="w-9 h-9 object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow-xs"
            />

            <div className="flex flex-col">
              <span className="text-[12px] font-bold tracking-tight text-white leading-tight">
                ATLAS | DAPD Kab. Buleleng
              </span>
              <span className="text-[9.5px] text-[#8DA6D2] font-normal leading-normal">
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
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#7995C5] uppercase">
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all group ${active
                          ? 'bg-white text-[#0B2256] font-bold shadow-xs'
                          : 'text-[#C7D7F2] hover:text-white hover:bg-white/10 font-normal'
                        }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${active
                            ? 'text-[#0B2256]'
                            : 'text-[#8DA6D2] group-hover:text-white'
                          }`}
                      />
                      <span className="truncate flex-1">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
