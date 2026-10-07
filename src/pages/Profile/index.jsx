import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchProfile } from '../../services/api'
import logoatlas from '../../assets/logoatlas.png'
import logo from '../../assets/Logo.png'
import KtaCard, { KtaFront, KtaBack } from '../../components/KtaCard'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, login } = useAuth()

  const [profileData, setProfileData] = useState(user || null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

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
          {/* LEFT: Kartu Anggota Visual & Interaktif KTA (5 cols) */}
          <div className="lg:col-span-5">
            <KtaCard
              memberNo={memberNo}
              name={name}
              photo={photo}
              createdAt={profileData?.created_at}
              locationName="Perpustakaan Daerah"
              onPrint={() => setShowPrintModal(true)}
            />
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

      {/* 5. Modal Preview & Cetak KTA */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#002B66] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Pratinjau Cetak KTA</h3>
                  <p className="text-xs text-blue-200">Kartu Tanda Anggota Perpustakaan Daerah Buleleng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Pratinjau 2 Sisi (Depan & Belakang) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#002B66]" />
                    <span>Sisi Depan (Identitas & Barcode)</span>
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                    <KtaFront
                      memberNo={memberNo}
                      name={name}
                      photo={photo}
                      createdAt={profileData?.created_at}
                      locationName="Perpustakaan Daerah"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Sisi Belakang (Tata Tertib)</span>
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                    <KtaBack />
                  </div>
                </div>
              </div>

              {/* Informasi & Panduan Cetak */}
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 space-y-2 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-2 text-amber-950">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Petunjuk Pencetakan KTA:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>
                    Ukuran kartu dirancang sesuai standar internasional <strong>ID-1 / CR-80</strong> (85.6 mm × 54.0 mm).
                  </li>
                  <li>
                    Disarankan mencetak menggunakan bahan <strong>PVC Card</strong> atau kertas tebal / Art Paper (260 - 310 gsm).
                  </li>
                  <li>
                    Pada jendela cetak peramban (browser), pastikan opsi <strong>"Background graphics / Grafik latar belakang"</strong> tercentang dan skala diatur ke <strong>100% / Default</strong>.
                  </li>
                  <li>
                    Anda juga dapat memilih tujuan <strong>"Save as PDF / Simpan sebagai PDF"</strong> untuk mengunduh dokumen KTA digital ke perangkat Anda.
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span>Cetak Sekarang (Print / PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Lembar Cetak Khusus (@media print) */}
      <div id="kta-print-sheet" className="hidden">
        <div className="print-content-wrapper">
          <div className="print-header">
            <h1 className="print-title">KARTU TANDA ANGGOTA PERPUSTAKAAN</h1>
            <p className="print-subtitle">DINAS ARSIP DAN PERPUSTAKAAN DAERAH KABUPATEN BULELENG</p>
          </div>

          <div className="print-cards-grid">
            <div className="print-card-item">
              <span className="print-card-label">TAMPAK DEPAN</span>
              <div className="print-card-box">
                <KtaFront
                  memberNo={memberNo}
                  name={name}
                  photo={photo}
                  createdAt={profileData?.created_at}
                  locationName="Perpustakaan Daerah"
                />
              </div>
            </div>

            <div className="print-card-item">
              <span className="print-card-label">TAMPAK BELAKANG</span>
              <div className="print-card-box">
                <KtaBack />
              </div>
            </div>
          </div>

          <div className="print-footer">
            <p>Portal Resmi Perpustakaan Daerah Kabupaten Buleleng (ATLAS) • #{memberNo} • {name}</p>
          </div>
        </div>
      </div>

      {/* Global CSS Khusus Pencetakan */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          #kta-print-sheet,
          #kta-print-sheet * {
            visibility: visible !important;
          }
          #kta-print-sheet {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-content-wrapper {
            max-width: 190mm;
            margin: 0 auto;
            text-align: center;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }
          .print-header {
            margin-bottom: 8mm;
            border-bottom: 2px solid #002B66;
            padding-bottom: 4mm;
          }
          .print-title {
            font-size: 16pt;
            font-weight: 800;
            color: #002B66;
            margin: 0;
            letter-spacing: 0.5px;
          }
          .print-subtitle {
            font-size: 10pt;
            font-weight: 600;
            color: #475569;
            margin: 2mm 0 0 0;
          }
          .print-cards-grid {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            gap: 10mm;
            margin: 8mm 0;
          }
          .print-card-item {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .print-card-label {
            font-size: 8pt;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 3mm;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .print-card-box {
            width: 85.6mm;
            height: 54.2mm;
            border-radius: 3.18mm;
            overflow: hidden;
            border: 0.5pt solid #cbd5e1;
            box-shadow: none;
          }
          .print-footer {
            margin-top: 10mm;
            border-top: 1px dashed #cbd5e1;
            padding-top: 4mm;
            font-size: 8pt;
            color: #64748b;
          }
        }
      `}</style>
    </div>
  )
}
