import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchProfile } from '../../services/api'
import logoatlas from '../../assets/logoatlas.png'
import logo from '../../assets/Logo.png'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, login } = useAuth()

  const [profileData, setProfileData] = useState(user || null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadLatestProfile() {
      const token = localStorage.getItem('atlas_token')
      if (!token) return

      try {
        setLoading(true)
        const res = await fetchProfile()
        if (res?.data) {
          setProfileData(res.data)
          // Update local auth state if different
          login(res.data, token)
        }
      } catch (err) {
        console.warn('Could not fetch server profile, using cached user:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLatestProfile()
  }, [])

  const handleCopyMemberNo = (memberNo) => {
    if (!memberNo) return
    navigator.clipboard.writeText(memberNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const memberNo = profileData?.member_no || 'MEM-202610-0001'
  const name = profileData?.name || 'Anggota ATLAS'
  const email = profileData?.email || '-'
  const phone = profileData?.phone_number || '-'
  const jobCategory = profileData?.job_category || 'UMUM'
  const institution = profileData?.institution_name || profileData?.institution || '-'
  const placeOfBirth = profileData?.place_of_birth || '-'
  const dateOfBirth = profileData?.date_of_birth
    ? new Date(profileData.date_of_birth).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-'
  const ktpAddress = profileData?.ktp_address || '-'
  const residentialAddress = profileData?.residential_address || '-'
  const photo = profileData?.photo_url || profileData?.photo_path || profileData?.avatar || null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* 1. Header / Navbar */}
      <header className="bg-[#00255c] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo Container */}
          <div
            className="bg-white rounded-2xl px-4 py-2 flex items-center shadow-md cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={logoatlas} alt="ATLAS Logo" className="h-9 sm:h-10 object-contain" />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={() => navigate('/opac')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              OPAC / Katalog
            </button>

            {/* Profile Active Badge */}
            <div className="bg-white/10 border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Profil Saya</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/30 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Keluar</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        {/* Welcome Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <button onClick={() => navigate('/')} className="hover:text-[#002B66]">
                Beranda
              </button>
              <span>/</span>
              <span className="text-[#002B66] font-bold">Profil Anggota</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032360] tracking-tight">
              Profil Anggota Perpustakaan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data diri, kartu tanda anggota (KTA), dan informasi akun Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/opac')}
              className="px-5 py-2.5 rounded-full bg-[#002B66] hover:bg-[#001D48] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Cari Buku di OPAC</span>
            </button>
          </div>
        </div>

        {/* 3. Kartu Tanda Anggota Digital (Digital Library Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Kartu Anggota Visual (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-sm font-bold text-[#032360] flex items-center justify-between">
              <span>Kartu Anggota Digital (KTA)</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Aktif
              </span>
            </div>

            {/* Smart Library Card Graphic */}
            <div className="relative rounded-3xl p-6 sm:p-7 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#001D48] via-[#002B66] to-[#0A3D8F] border border-blue-400/20">
              {/* Decorative Background Elements */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={logo}
                    alt="ATLAS Emblem"
                    className="h-10 w-10 object-contain drop-shadow"
                  />
                  <div>
                    <h3 className="text-[11px] font-extrabold tracking-wider uppercase text-blue-200 leading-tight">
                      Perpustakaan Daerah
                    </h3>
                    <p className="text-[9px] font-medium text-slate-300">
                      Kabupaten Buleleng — ATLAS
                    </p>
                  </div>
                </div>

                {/* RFID / Smart Chip Icon */}
                <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center opacity-90">
                  <div className="w-4 h-3 border border-amber-600/40 rounded-sm" />
                </div>
              </div>

              {/* Card Body: Photo & Member Details */}
              <div className="relative z-10 mt-5 flex items-start gap-4">
                {/* Photo Container */}
                <div className="w-20 h-26 sm:w-24 sm:h-30 rounded-2xl bg-white/10 border-2 border-white/40 overflow-hidden shrink-0 shadow-md">
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/60 p-2 text-center text-[10px]">
                      <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Pasfoto</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {jobCategory}
                  </span>

                  <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate" title={name}>
                    {name}
                  </h2>

                  <p className="text-xs text-blue-200 truncate font-medium" title={institution}>
                    {institution !== '-' ? institution : 'Anggota Perpustakaan'}
                  </p>

                  <div className="pt-2">
                    <span className="block text-[10px] text-slate-400 font-semibold">Nomor Anggota:</span>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-white tracking-wider">
                      {memberNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Barcode Simulation & Validity */}
              <div className="relative z-10 mt-5 pt-3.5 border-t border-white/15 flex items-end justify-between text-[10px]">
                <div>
                  <span className="block text-slate-400">Masa Berlaku</span>
                  <span className="font-bold text-white">Seumur Hidup / Aktif</span>
                </div>

                {/* Simulated Barcode */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center gap-[2px] h-5 opacity-80">
                    {[3, 1, 4, 1, 2, 5, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-sm h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-slate-400">{memberNo}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Member Card */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyMemberNo(memberNo)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 text-[#002B66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Nomor Anggota'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                title="Cetak Kartu Anggota"
              >
                <svg className="w-4 h-4 text-[#002B66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Detail Biodata & Info Anggota (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card Biodata */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#002B66] flex items-center justify-center font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#032360]">Data Diri Anggota</h2>
                    <p className="text-xs text-slate-500">Informasi identitas resmi sesuai database perpustakaan</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/form-data-diri', { state: { email, name } })}
                  className="text-xs font-bold text-[#002B66] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span>Perbarui Data</span>
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Nama Lengkap */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Nama Lengkap</span>
                  <p className="font-bold text-slate-800 text-sm">{name}</p>
                </div>

                {/* Nomor Anggota */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Nomor Anggota</span>
                  <p className="font-mono font-bold text-[#002B66] text-sm">{memberNo}</p>
                </div>

                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Alamat Email</span>
                  <p className="font-bold text-slate-800 break-all">{email}</p>
                </div>

                {/* Nomor Handphone */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Nomor WhatsApp / HP</span>
                  <p className="font-bold text-slate-800">{phone}</p>
                </div>

                {/* Kategori Pekerjaan */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Kategori Pekerjaan</span>
                  <p className="font-bold text-slate-800 uppercase">{jobCategory}</p>
                </div>

                {/* Instansi */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Nama Instansi / Sekolah</span>
                  <p className="font-bold text-slate-800">{institution}</p>
                </div>

                {/* Tempat, Tanggal Lahir */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Tempat, Tanggal Lahir</span>
                  <p className="font-bold text-slate-800">
                    {placeOfBirth !== '-' ? `${placeOfBirth}, ` : ''}{dateOfBirth}
                  </p>
                </div>

                {/* Alamat Tinggal */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Alamat Tempat Tinggal Saat Ini</span>
                  <p className="font-medium text-slate-800 leading-relaxed">{residentialAddress}</p>
                </div>

                {/* Alamat KTP */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Alamat Sesuai KTP</span>
                  <p className="font-medium text-slate-800 leading-relaxed">{ktpAddress}</p>
                </div>
              </div>
            </div>

            {/* Hak Akses & Layanan Anggota */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-[#032360] uppercase tracking-wider">
                Fasilitas & Hak Anggota Terdaftar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2 text-emerald-800">
                  <span>✓</span> <span>Peminjaman buku sirkulasi hingga 3 eksemplar</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <span>✓</span> <span>Akses baca & reservasi koleksi di tempat</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <span>✓</span> <span>Layanan mandiri perpanjangan masa pinjam</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <span>✓</span> <span>Penyimpanan barang & loker pengunjung</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-[#001D48] text-white py-6 border-t border-[#001738] mt-12 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng (ATLAS)</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-300 hover:text-white transition-colors cursor-pointer"
          >
            Kembali ke Beranda ATLAS
          </button>
        </div>
      </footer>
    </div>
  )
}
