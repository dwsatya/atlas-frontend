import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [count, setCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-pink-400">
                A
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              ATLAS <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Private Area</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Protected Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        {/* Status Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Status Rute: Privat & Terotentikasi</h2>
              <p className="text-xs text-slate-400">
                Halaman ini hanya dapat diakses melalui <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">&lt;PrivateRoute /&gt;</code>.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Session Active
          </span>
        </div>

        {/* Hero Card */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Selamat Datang, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.name}</span>
          </h1>

          <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
            Anda berhasil mengakses halaman privat aplikasi ATLAS. Sistem routing terlindungi dengan <code className="text-indigo-400">react-router-dom</code> dan <code className="text-indigo-400">PrivateRoute</code>.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:border-indigo-500/40 transition-all duration-200"
            >
              Counter Interaktif: <span className="text-indigo-400 font-bold ml-1">{count}</span>
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-indigo-400 font-bold mb-2">🔒 Protection</div>
            <h3 className="text-base font-bold text-white mb-1">Route Guarding</h3>
            <p className="text-xs text-slate-400">
              Jika pengguna belum login dan mencoba mengakses rute ini, pengguna akan dipaksa redirect ke <code className="text-indigo-300">/login</code>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-purple-400 font-bold mb-2">🔄 Redirect Memory</div>
            <h3 className="text-base font-bold text-white mb-1">State Preservation</h3>
            <p className="text-xs text-slate-400">
              URL tujuan disimpan via <code className="text-purple-300">location.state</code> agar setelah login pengguna kembali ke URL semula.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-emerald-400 font-bold mb-2">⚡ Auth Context</div>
            <h3 className="text-base font-bold text-white mb-1">Global State</h3>
            <p className="text-xs text-slate-400">
              Manajemen sesi terpusat dengan <code className="text-emerald-300">AuthContext</code> dan <code className="text-emerald-300">localStorage</code>.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        ATLAS Frontend — Private Route Integration
      </footer>
    </div>
  )
}
