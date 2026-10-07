import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginMember } from '../../services/api'
import background1 from '../../assets/background1.jpeg'
import { loginUser, getGoogleLoginUrl } from '../../services/api'

export default function LoginUser() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Handle Google OAuth Callback params on redirect
    useEffect(() => {
        const tokenParam = searchParams.get('token')
        const userParam = searchParams.get('user')
        const errorParam = searchParams.get('error')

        if (errorParam) {
            setErrorMessage(decodeURIComponent(errorParam))
        } else if (tokenParam && userParam) {
            try {
                const parsedUser = JSON.parse(decodeURIComponent(userParam))
                login(parsedUser, tokenParam)
                navigate('/dashboard', { replace: true })
            } catch (err) {
                console.error('Failed to parse Google user parameter:', err)
            }
        }
    }, [searchParams, login, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) return
        setErrorMessage(null)

        try {
            setLoading(true)
            const response = await loginMember({ email, password })
            if (response?.success) {
                const memberData = response?.data?.member || { name: email.split('@')[0], email }
                const token = response?.token || response?.data?.token
                login(memberData, token)
                navigate('/dashboard')
            }
        } catch (err) {
            setErrorMessage(err.message || 'Email atau password salah.')
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        navigate('/')
    }

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white"
            style={{
                backgroundImage: `url(${background1}), url('/background1.jpeg')`,
            }}
        >
            {/* Dark Overlay over the background image */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[0.5px]" />

            {/* Top-Left 'Kembali' Button */}
            <button
                type="button"
                onClick={handleBack}
                className="fixed top-6 left-6 z-30 bg-white hover:bg-slate-50 text-[#032360] px-5 py-2 rounded-full font-bold text-sm shadow-md flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
            >
                <svg
                    className="w-4 h-4 stroke-[2.5]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                </svg>
                <span>Kembali</span>
            </button>

            {/* Centered White Login Card */}
            <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6">
                <h1 className="text-3xl font-extrabold text-center text-[#032360] tracking-tight">
                    Login
                </h1>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
                        <svg
                            className="w-5 h-5 shrink-0 text-red-500 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <span className="leading-relaxed">{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-[#032360]">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@domain.com"
                            className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all"
                        />
                    </div>

                    {/* Password Input with Eye Toggle */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-[#032360]">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-5 py-3 pr-12 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-[#032360] hover:opacity-80 p-1 focus:outline-none cursor-pointer"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.126 10.126 0 013.682-.787c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.04-2.887a3.5 3.5 0 11-4.95-4.95"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 3l18 18"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Ingat Saya & Lupa Password */}
                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                        <label className="flex items-center gap-2 font-bold text-[#032360] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 accent-[#002B66] cursor-pointer"
                            />
                            <span>Ingat saya</span>
                        </label>

                        <a
                            href="#forgot-password"
                            className="font-bold text-[#032360] hover:underline"
                        >
                            Lupa Password?
                        </a>
                    </div>

                    {/* Button Masuk */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-full bg-[#002B66] hover:bg-[#001D48] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Masuk</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Link Daftar Anggota Baru */}
                <div className="text-center text-xs sm:text-sm text-slate-700 pt-1">
                    Belum menjadi anggota?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="font-bold text-[#032360] hover:underline cursor-pointer bg-transparent border-none p-0 inline"
                    >
                        Daftar Anggota Baru
                    </button>
                </div>

                {/* Social Login dengan Google */}
                <div className="flex items-center justify-center gap-3 pt-1 text-xs sm:text-sm font-bold text-[#032360]">
                    <span>Atau masuk dengan:</span>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = 'http://localhost:8000/auth/google'
                        }}
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Masuk dengan Google"
                        title="Masuk dengan Akun Google"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
