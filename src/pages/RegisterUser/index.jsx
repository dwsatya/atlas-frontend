import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGoogleLoginUrl } from '../../services/api'
import background1 from '../../assets/background1.jpeg'

// Sama dengan aturan regex email di MemberRegisterController (backend)
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]{2,}(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/

export default function RegisterUser() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Validasi format email: nama@domain.tld
    const isEmailValid = EMAIL_REGEX.test(email.trim())
    const showEmailError = email.trim() !== '' && !isEmailValid

    // Kriteria validasi password: min 8 karakter, huruf besar & kecil, 1 angka, 1 simbol
    const hasMinLength = password.length >= 8
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9\s]/.test(password)
    const isPasswordValid = hasMinLength && hasMixedCase && hasNumber && hasSymbol
    const passwordsMatch = Boolean(confirmPassword && password === confirmPassword)

    const handleSubmit = (e) => {
        e.preventDefault()
        setErrorMessage('')

        if (!email.trim() || !password) {
            setErrorMessage('Email dan password wajib diisi.')
            return
        }
        if (!isEmailValid) {
            setErrorMessage('Format email tidak valid. Contoh: nama@domain.com')
            return
        }
        if (!hasMinLength) {
            setErrorMessage('Password minimal harus 8 karakter.')
            return
        }
        if (!hasMixedCase) {
            setErrorMessage('Password harus mengandung minimal 1 huruf besar (A-Z) dan 1 huruf kecil (a-z).')
            return
        }
        if (!hasNumber) {
            setErrorMessage('Password harus mengandung minimal 1 angka (0-9).')
            return
        }
        if (!hasSymbol) {
            setErrorMessage('Password harus mengandung minimal 1 simbol (contoh: !@#$%^&*).')
            return
        }
        if (password !== confirmPassword) {
            setErrorMessage('Password dan Konfirmasi Password tidak cocok!')
            return
        }
        // Proceed to next step: form data diri
        navigate('/form-data-diri', { state: { email, password } })
    }

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/login')
        }
    }

    return (
        <div className="relative h-screen w-full overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Fixed Background Image */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                style={{
                    backgroundImage: `url(${background1}), url('/background1.jpeg')`,
                }}
            >
                {/* Dark Overlay over the background image */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[0.5px]" />
            </div>

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

            {/* Scrollable Container - Hanya form registrasi yang scroll */}
            <div className="relative z-10 h-full w-full overflow-y-auto flex items-center justify-center p-4 py-8">
                {/* Centered White Register Card */}
                <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 my-auto">
                <h1 className="text-3xl font-extrabold text-center text-[#032360] tracking-tight">
                    Daftar Anggota Baru
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
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errorMessage) setErrorMessage('')
                            }}
                            placeholder="example@domain.com"
                            aria-invalid={showEmailError}
                            className={`w-full px-5 py-3 rounded-full border text-slate-800 placeholder-slate-400 text-sm focus:outline-none transition-all ${
                                showEmailError
                                    ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                                    : 'border-slate-300 focus:border-[#032360] focus:ring-1 focus:ring-[#032360]'
                            }`}
                        />
                        {showEmailError && (
                            <p className="text-xs text-red-600 pl-4">
                                Format email tidak valid. Contoh: nama@domain.com
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-[#032360]">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errorMessage) setErrorMessage('')
                                }}
                                placeholder="Password"
                                className={`w-full px-5 py-3 pr-12 rounded-full border text-slate-800 placeholder-slate-400 text-sm focus:outline-none transition-all ${
                                    password && isPasswordValid
                                        ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                        : 'border-slate-300 focus:border-[#032360] focus:ring-1 focus:ring-[#032360]'
                                }`}
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

                        {/* Password Requirements Information Box */}
                        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2 text-xs mt-2">
                            <div className="flex items-center gap-1.5 font-bold text-[#032360]">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Ketentuan Password:</span>
                            </div>
                            <ul className="space-y-1.5 pl-0.5">
                                <li className={`flex items-center gap-2 transition-colors ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                                    {hasMinLength ? (
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mx-1.5" />
                                    )}
                                    <span>Minimal 8 karakter</span>
                                </li>
                                <li className={`flex items-center gap-2 transition-colors ${hasMixedCase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                                    {hasMixedCase ? (
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mx-1.5" />
                                    )}
                                    <span>Minimal 1 huruf besar (A-Z) dan 1 huruf kecil (a-z)</span>
                                </li>
                                <li className={`flex items-center gap-2 transition-colors ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                                    {hasNumber ? (
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mx-1.5" />
                                    )}
                                    <span>Minimal 1 angka (0-9)</span>
                                </li>
                                <li className={`flex items-center gap-2 transition-colors ${hasSymbol ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                                    {hasSymbol ? (
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mx-1.5" />
                                    )}
                                    <span>Minimal 1 simbol (contoh: ! @ # $ % ^ & *)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Konfirmasi Password Input */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-[#032360]">
                            Konfirmasi Password
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    if (errorMessage) setErrorMessage('')
                                }}
                                placeholder="Password"
                                className={`w-full px-5 py-3 pr-12 rounded-full border text-slate-800 placeholder-slate-400 text-sm focus:outline-none transition-all ${
                                    confirmPassword
                                        ? passwordsMatch
                                            ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                            : 'border-red-400 focus:ring-1 focus:ring-red-400'
                                        : 'border-slate-300 focus:border-[#032360] focus:ring-1 focus:ring-[#032360]'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 text-[#032360] hover:opacity-80 p-1 focus:outline-none cursor-pointer"
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? (
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

                        {/* Konfirmasi Password Helper / Feedback */}
                        {confirmPassword && (
                            <div className="text-xs px-2 pt-1">
                                {passwordsMatch ? (
                                    <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Konfirmasi password cocok
                                    </span>
                                ) : (
                                    <span className="text-red-500 font-medium flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Konfirmasi password belum cocok
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button: Selanjutnya (Full-width, tanpa tanda panah, ukuran sama dengan Masuk dengan Google) */}
                    <div className="pt-1">
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-full bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
                        >
                            <span>Selanjutnya</span>
                        </button>
                    </div>
                </form>

                {/* Separator / Atau: */}
                <div className="text-center text-xs sm:text-sm font-semibold text-[#032360] -mt-1">
                    Atau:
                </div>

                {/* Social Login dengan Google (Full Pill Button) */}
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = getGoogleLoginUrl()
                        }}
                        className="w-full py-3 px-4 rounded-full border border-[#032360] bg-white hover:bg-slate-50 text-[#032360] font-bold text-sm sm:text-base shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
                        aria-label="Masuk dengan Google"
                    >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                        <span>Masuk dengan Google</span>
                    </button>
                </div>

                {/* Link Sudah menjadi anggota? Masuk */}
                <div className="text-center text-xs sm:text-sm text-[#032360] pt-1">
                    Sudah menjadi anggota?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="font-bold text-[#032360] hover:underline cursor-pointer bg-transparent border-none p-0 inline"
                    >
                        Masuk
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}
