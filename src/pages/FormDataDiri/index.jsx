import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerMember } from '../../services/api'
import background1 from '../../assets/background1.jpeg'

export default function FormDataDiri() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { login, user: authUser } = useAuth()

    // Ambil data Google dari query parameter jika dialihkan langsung oleh backend
    const tokenParam = searchParams.get('token')
    const userParam = searchParams.get('user')

    let queryUser = null
    if (userParam) {
        try {
            queryUser = JSON.parse(decodeURIComponent(userParam))
        } catch (e) {
            console.error('Failed to parse user param in FormDataDiri:', e)
        }
    }

    const initialEmail = queryUser?.email || location.state?.email || authUser?.email || ''
    const initialPassword = location.state?.password || ''
    const initialName = queryUser?.name || location.state?.name || authUser?.name || ''
    const initialAvatar = queryUser?.avatar || queryUser?.photo_path || location.state?.avatar || authUser?.avatar || authUser?.photo_path || null
    const fromGoogle = Boolean(queryUser || location.state?.fromGoogle || authUser?.google_id || initialAvatar)

    const [email, setEmail] = useState(initialEmail)
    const [password, setPassword] = useState(initialPassword)
    const [namaLengkap, setNamaLengkap] = useState(initialName)
    const [avatar, setAvatar] = useState(initialAvatar)
    const [isGoogleAccount, setIsGoogleAccount] = useState(fromGoogle)

    const [alamatTinggal, setAlamatTinggal] = useState('')
    const [alamatKtp, setAlamatKtp] = useState('')
    const [samaDenganAlamatTinggal, setSamaDenganAlamatTinggal] = useState(false)
    const [tempatLahir, setTempatLahir] = useState('')
    const [tanggalLahir, setTanggalLahir] = useState('')
    const [pekerjaan, setPekerjaan] = useState('')
    const [instansi, setInstansi] = useState('')
    const [noHandphone, setNoHandphone] = useState('')
    const [fotoFormal, setFotoFormal] = useState(null)

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    // Tangani penyimpanan sesi login dan prefill data akun dari callback Google
    useEffect(() => {
        if (tokenParam && queryUser) {
            login(queryUser, tokenParam)
            setEmail(queryUser.email || '')
            setNamaLengkap(queryUser.name || '')
            setAvatar(queryUser.avatar || queryUser.photo_path || null)
            setIsGoogleAccount(true)
            // Bersihkan token dari URL address bar tanpa reload
            window.history.replaceState({}, document.title, window.location.pathname)
        }
    }, [tokenParam, userParam, login])

    const handlePekerjaanChange = (option) => {
        setPekerjaan(pekerjaan === option ? '' : option)
    }

    const handleSameAddressChange = (checked) => {
        setSamaDenganAlamatTinggal(checked)
        if (checked) {
            setAlamatKtp(alamatTinggal)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage(null)
        setSuccessMessage(null)

        if (!email) {
            setErrorMessage('Email wajib diisi. Silakan kembali ke form pendaftaran atau isi email.')
            return
        }

        if (!isGoogleAccount && !fromGoogle && (!password || password.length < 6)) {
            setErrorMessage('Password minimal harus 6 karakter.')
            return
        }

        if (!pekerjaan) {
            setErrorMessage('Silakan pilih salah satu kategori pekerjaan (Umum, Pelajar, atau Mahasiswa).')
            return
        }

        if (!fotoFormal && !avatar && !initialAvatar) {
            setErrorMessage('Foto formal wajib diunggah untuk kartu anggota perpustakaan.')
            return
        }

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append('name', namaLengkap)
            formData.append('email', email)
            if (password) {
                formData.append('password', password)
            }
            formData.append('residential_address', alamatTinggal)
            formData.append('ktp_address', alamatKtp)
            formData.append('place_of_birth', tempatLahir)
            formData.append('date_of_birth', tanggalLahir)
            formData.append('job_category', pekerjaan.toUpperCase())
            formData.append('institution_name', instansi)
            formData.append('phone_number', noHandphone)
            if (fotoFormal) {
                formData.append('photo', fotoFormal)
            }

            const response = await registerMember(formData)

            if (response?.success) {
                const memberData = response?.data?.member || {
                    name: namaLengkap,
                    email,
                    phone_number: noHandphone,
                    job_category: pekerjaan.toUpperCase(),
                    institution: instansi,
                    photo_path: response?.data?.member?.photo_path || avatar || initialAvatar,
                    member_no: response?.data?.member?.member_no,
                }
                const token = response?.token || response?.data?.token

                login(memberData, token)
                setSuccessMessage(response.message || 'Pendaftaran berhasil!')

                // Redirect langsung ke halaman profil
                setTimeout(() => {
                    navigate('/profile', { replace: true })
                }, 1000)
            }
        } catch (err) {
            console.error('Registration failed:', err)
            setErrorMessage(err.message || 'Gagal mendaftar anggota perpustakaan. Periksa kembali isian formulir.')
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/register')
        }
    }

    return (
        <div className="min-h-screen w-full relative selection:bg-indigo-500 selection:text-white">
            {/* Fixed Background Image & Overlay */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
                style={{
                    backgroundImage: `url(${background1}), url('/background1.jpeg')`,
                }}
            >
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

            {/* Scrollable Form Container */}
            <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 py-12 sm:py-16">
                <div className="w-full max-w-[540px] bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 my-auto">
                    <div>
                        <h1 className="text-3xl font-extrabold text-center text-[#032360] tracking-tight">
                            Isi Data Diri
                        </h1>
                        <p className="text-xs text-center text-slate-500 mt-1">
                            Lengkapi data diri untuk pembuatan kartu anggota Perpustakaan Buleleng
                        </p>
                    </div>

                    {/* Google Login Badge jika dari Google */}
                    {(isGoogleAccount || fromGoogle) && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 flex items-center gap-3">
                            {(avatar || initialAvatar) ? (
                                <img
                                    src={avatar || initialAvatar}
                                    alt="Google Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    G
                                </div>
                            )}
                            <div className="text-xs min-w-0">
                                <span className="inline-block px-2 py-0.5 rounded-md font-bold bg-blue-100 text-[#002B66] text-[10px] mb-0.5">
                                    ✓ Akun Google Terhubung
                                </span>
                                <p className="font-bold text-[#032360] truncate">{email || initialEmail}</p>
                                <p className="text-slate-500 text-[11px]">Silakan lengkapi data diri Anda untuk penerbitan kartu anggota perpustakaan.</p>
                            </div>
                        </div>
                    )}

                    {/* Email Badge jika dari langkah registrasi sebelumnya biasa */}
                    {(email || initialEmail) && !isGoogleAccount && !fromGoogle ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-slate-600 truncate">
                                <svg
                                    className="w-4 h-4 text-[#032360] shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                    />
                                </svg>
                                <span className="truncate">
                                    Akun: <strong className="text-[#032360]">{email || initialEmail}</strong>
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/register', { state: { email, password } })}
                                className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer shrink-0 ml-2"
                            >
                                Ubah
                            </button>
                        </div>
                    ) : null}

                    {/* Alert Pesan Error */}
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

                    {/* Alert Pesan Sukses */}
                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
                            <svg
                                className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="leading-relaxed">
                                {successMessage} Mengarahkan ke dashboard...
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Fallback Email & Password jika user langsung mengakses /form-data-diri */}
                        {(!initialEmail && !email && !isGoogleAccount && !fromGoogle) && (
                            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-[#032360]">
                                        Email Akun
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@domain.com"
                                        className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-[#032360]">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Nama Lengkap */}
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-[#032360]">
                                Nama Lengkap
                            </label>
                            <span className="block text-xs text-slate-500 font-medium">
                                Sesuai KTP / Identitas Resmi
                            </span>
                            <input
                                type="text"
                                required
                                value={namaLengkap}
                                onChange={(e) => setNamaLengkap(e.target.value)}
                                placeholder="Contoh: I Putu Arya Permana"
                                className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                            />
                        </div>

                        {/* Alamat Tinggal */}
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-[#032360]">
                                Alamat Tinggal
                            </label>
                            <input
                                type="text"
                                required
                                value={alamatTinggal}
                                onChange={(e) => {
                                    setAlamatTinggal(e.target.value)
                                    if (samaDenganAlamatTinggal) {
                                        setAlamatKtp(e.target.value)
                                    }
                                }}
                                placeholder="Contoh: Jl. Ngurah Rai No. 10, Singaraja"
                                className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                            />
                        </div>

                        {/* Alamat Sesuai KTP */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-[#032360]">
                                    Alamat Sesuai KTP
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={samaDenganAlamatTinggal}
                                        onChange={(e) => handleSameAddressChange(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-slate-300 accent-[#002B66]"
                                    />
                                    <span>Sama dengan alamat tinggal</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                required
                                value={alamatKtp}
                                onChange={(e) => {
                                    setAlamatKtp(e.target.value)
                                    setSamaDenganAlamatTinggal(false)
                                }}
                                placeholder="Contoh: Jl. Ngurah Rai No. 10, Singaraja"
                                className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                            />
                        </div>

                        {/* Tempat & Tanggal Lahir (Grid 2 Kolom) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-[#032360]">
                                    Tempat Lahir
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={tempatLahir}
                                    onChange={(e) => setTempatLahir(e.target.value)}
                                    placeholder="Contoh: Singaraja"
                                    className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-[#032360]">
                                    Tanggal Lahir
                                </label>
                                <input
                                    type="date"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    value={tanggalLahir}
                                    onChange={(e) => setTanggalLahir(e.target.value)}
                                    className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                                />
                            </div>
                        </div>

                        {/* Pekerjaan */}
                        <div className="space-y-2 pt-1">
                            <label className="block text-sm font-bold text-[#032360]">
                                Pekerjaan
                            </label>
                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                {['Umum', 'Pelajar', 'Mahasiswa'].map((option) => (
                                    <label
                                        key={option}
                                        className="flex items-center gap-2 text-sm font-semibold text-[#032360] cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={pekerjaan === option}
                                            onChange={() => handlePekerjaanChange(option)}
                                            className="w-4 h-4 rounded border-slate-300 accent-[#002B66] cursor-pointer"
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Instansi */}
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-[#032360]">
                                Instansi
                            </label>
                            <input
                                type="text"
                                required
                                value={instansi}
                                onChange={(e) => setInstansi(e.target.value)}
                                placeholder="Contoh: Universitas Pendidikan Ganesha"
                                className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                            />
                        </div>

                        {/* Nomor Handphone */}
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-[#032360]">
                                Nomor Handphone
                            </label>
                            <span className="block text-xs text-slate-500 font-medium">
                                Nomor yang terdaftar di WhatsApp
                            </span>
                            <input
                                type="tel"
                                required
                                value={noHandphone}
                                onChange={(e) => setNoHandphone(e.target.value)}
                                placeholder="Contoh: 08123456789"
                                className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                            />
                        </div>

                        {/* Upload Foto Formal */}
                        <div className="space-y-2 pt-1">
                            <label className="block text-sm font-bold text-[#032360]">
                                Foto Formal
                            </label>
                            <span className="block text-xs text-slate-500 font-medium leading-relaxed">
                                Ketentuan bebas rapi, Setengah Badan, Wajah Terlihat Jelas, format jpg atau png (Maks. 2MB)
                            </span>

                            <div className="pt-2 flex justify-center">
                                <label className="group relative w-36 h-48 sm:w-40 sm:h-52 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#002B66] bg-slate-50/80 hover:bg-slate-100/80 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        required={!fotoFormal && !avatar && !initialAvatar}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) setFotoFormal(file)
                                        }}
                                        className="hidden"
                                    />

                                    {fotoFormal ? (
                                        <>
                                            <img
                                                src={URL.createObjectURL(fotoFormal)}
                                                alt="Preview Foto Formal"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Mobile Overlay */}
                                            <div className="sm:hidden absolute bottom-0 inset-x-0 bg-slate-900/80 text-white py-1.5 px-2 flex items-center justify-center gap-1.5 text-[11px] font-bold backdrop-blur-[2px]">
                                                <svg
                                                    className="w-3.5 h-3.5 stroke-[2.5]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                                                    />
                                                </svg>
                                                <span>Ganti Foto</span>
                                            </div>

                                            {/* Desktop Overlay */}
                                            <div className="hidden sm:flex absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col items-center justify-center text-white p-2 text-center backdrop-blur-[1px]">
                                                <svg
                                                    className="w-7 h-7 mb-1 stroke-[2]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                                                    />
                                                </svg>
                                                <span className="text-xs font-bold">Ganti Foto</span>
                                            </div>
                                        </>
                                    ) : (avatar || initialAvatar) ? (
                                        <>
                                            <img
                                                src={avatar || initialAvatar}
                                                alt="Preview Foto Akun Google"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white py-1.5 px-2 flex items-center justify-center gap-1 text-[11px] font-bold backdrop-blur-[2px]">
                                                <span>Ganti Pasfoto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-[#032360] group-hover:bg-[#002B66] group-hover:text-white transition-colors duration-200">
                                                <svg
                                                    className="w-6 h-6 stroke-[2]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="block text-xs font-bold text-[#032360] group-hover:text-[#002B66]">
                                                    Upload Foto
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-medium">
                                                    Pasfoto Formal
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3.5 rounded-full bg-[#002B66] hover:bg-[#001D48] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-w-[180px]"
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
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Data</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
