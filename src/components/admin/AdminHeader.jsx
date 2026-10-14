import { useState } from 'react'
import { Menu, Bell, User, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const adminName = user?.name || 'Ridwan Surasta'
  const adminRole = user?.role || 'Administrator'

  // Format Indonesian date
  const currentDateFormatted = 'Selasa, 16 Sep 2026'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs h-16 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">ATLAS DAPD</span>
          <span>/</span>
          <span className="text-slate-500">Pengelolaan Koleksi</span>
          <span>/</span>
          <span className="text-blue-700 font-semibold">Entri Katalog</span>
        </div>
      </div>

      {/* Right: Status, Date, User Info */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Status Online Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="whitespace-nowrap">Sirkulasi Aktif (Online)</span>
        </div>

        {/* Date Display */}
        <div className="hidden md:block text-xs font-medium text-slate-600 whitespace-nowrap">
          {currentDateFormatted}
        </div>

        <div className="hidden md:block h-5 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {adminName}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {adminRole}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-[#071739] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-xs">
              {adminName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'AD'}
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{adminName}</p>
                <p className="text-[11px] text-slate-500">{adminRole}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false)
                  navigate('/profile')
                }}
                className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Profil Akun</span>
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
