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
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs h-14 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Trigger (hidden on desktop to match screenshot) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Status, Date, User Info */}
      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        {/* Status Online Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EE] border border-[#B6E8C7] text-[#059669] text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          <span className="whitespace-nowrap text-[11px] sm:text-xs">Sirkulasi Aktif (Online)</span>
        </div>

        {/* Date Display */}
        <div className="hidden sm:block text-xs font-medium text-slate-600 whitespace-nowrap">
          {currentDateFormatted}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {adminName}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight">
                {adminRole}
              </div>
            </div>

            {/* Circular user avatar with outline person icon matching screenshot */}
            <div className="w-8 h-8 rounded-full border border-slate-300 bg-white text-slate-700 flex items-center justify-center shadow-2xs">
              <User className="w-4.5 h-4.5 text-slate-600 stroke-[1.8]" />
            </div>
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
