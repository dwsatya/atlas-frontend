import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import background1 from '../../assets/background1.jpeg'

export default function FormDataDiri() {
    const navigate = useNavigate()

    const [namaLengkap, setNamaLengkap] = useState('')
    const [alamatTinggal, setAlamatTinggal] = useState('')
    const [alamatKtp, setAlamatKtp] = useState('')
    const [tempatTanggalLahir, setTempatTanggalLahir] = useState('')
    const [pekerjaan, setPekerjaan] = useState('')
    const [instansi, setInstansi] = useState('')
    const [noHandphone, setNoHandphone] = useState('')
    const [fotoFormal, setFotoFormal] = useState(null)

    const handlePekerjaanChange = (option) => {
        setPekerjaan(pekerjaan === option ? '' : option)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Data Diri submitted:', {
            namaLengkap,
            alamatTinggal,
            alamatKtp,
            tempatTanggalLahir,
            pekerjaan,
            instansi,
            noHandphone,
            fotoFormal,
        })
        // Navigate to dashboard after filling personal data
        navigate('/dashboard')
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
            {/* Fixed Background Image & Overlay (Tidak bergerak saat scrolling) */}
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
                <div className="w-full max-w-[520px] bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 my-auto">
                    <h1 className="text-3xl font-extrabold text-center text-[#032360] tracking-tight">
                        Isi Data Diri
                    </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nama Lengkap */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-[#032360]">
                            Nama Lengkap
                        </label>
                        <span className="block text-xs text-slate-500 font-medium">
                            Sesuai KTP
                        </span>
                        <input
                            type="text"
                            required
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            placeholder="example@domain.com"
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
                            onChange={(e) => setAlamatTinggal(e.target.value)}
                            placeholder="example@domain.com"
                            className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                        />
                    </div>

                    {/* Alamat Sesuai KTP */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-[#032360]">
                            Alamat Sesuai KTP
                        </label>
                        <span className="block text-xs text-slate-500 font-medium">
                            Sesuai KTP
                        </span>
                        <input
                            type="text"
                            required
                            value={alamatKtp}
                            onChange={(e) => setAlamatKtp(e.target.value)}
                            placeholder="example@domain.com"
                            className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                        />
                    </div>

                    {/* Tempat, Tanggal & Lahir */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-[#032360]">
                            Tempat, Tanggal & Lahir
                        </label>
                        <input
                            type="text"
                            required
                            value={tempatTanggalLahir}
                            onChange={(e) => setTempatTanggalLahir(e.target.value)}
                            placeholder="example@domain.com"
                            className="w-full px-5 py-3 rounded-full border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#032360] focus:ring-1 focus:ring-[#032360] transition-all mt-1"
                        />
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
                            type="text"
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
                            Ketentuan bebas rapi, Setengah Badan, Wajah Terlihat Jelas, format jpg atau png
                        </span>

                        <div className="pt-2 flex justify-center">
                            <label className="group relative w-36 h-48 sm:w-40 sm:h-52 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#002B66] bg-slate-50/80 hover:bg-slate-100/80 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    required={!fotoFormal}
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

                                        {/* Mobile Overlay (Tampil Selalu di HP) */}
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

                                        {/* Desktop Overlay (Tampil Saat Hover di Desktop) */}
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
                            className="px-10 py-3 rounded-full bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>Simpan Data</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}
