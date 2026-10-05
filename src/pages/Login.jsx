import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    login(username)
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl shadow-indigo-500/10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] mb-4 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-pink-400">
              A
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">ATLAS Portal</h2>
          <p className="text-sm text-slate-400 mt-1">Silakan masuk untuk mengakses rute privat (PrivateRoute)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Nama / Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: Developer ATLAS"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-200"
          >
            Masuk (Login) &rarr;
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4">
          Halaman ini dilindungi oleh <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">PrivateRoute</code>
        </div>
      </div>
    </div>
  )
}
