import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchProfile, updateProfile } from '../../services/api'
import logoatlas from '../../assets/logoatlas.png'
import logo from '../../assets/Logo.png'
import KtaCard, { KtaFront, KtaBack } from '../../components/KtaCard'
import { resolvePhotoUrl, downloadKtaImage } from '../../utils/ktaImageGenerator'

function formatDateForInput(dateVal) {
  if (!dateVal) return ''
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, login } = useAuth()

  const [profileData, setProfileData] = useState(user || null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

  // State untuk Mode Edit Profil Langsung
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    job_category: 'UMUM',
    institution_name: '',
    place_of_birth: '',
    date_of_birth: '',
    residential_address: '',
    ktp_address: '',
  })
  const [sameAddress, setSameAddress] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)
  const [downloadingSide, setDownloadingSide] = useState(null)

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

  const startEditing = () => {
    setEditForm({
      name: profileData?.name || '',
      email: profileData?.email || '',
      phone_number: profileData?.phone_number || '',
      job_category: profileData?.job_category || 'UMUM',
      institution_name: profileData?.institution_name || profileData?.institution || '',
      place_of_birth: profileData?.place_of_birth || '',
      date_of_birth: formatDateForInput(profileData?.date_of_birth),
      residential_address: profileData?.residential_address || '',
      ktp_address: profileData?.ktp_address || '',
    })
    setSameAddress(
      Boolean(
        profileData?.residential_address &&
        profileData?.residential_address === profileData?.ktp_address
      )
    )
    setPhotoFile(null)
    setPhotoPreview(null)
    setSaveError(null)
    setSaveSuccess(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setPhotoFile(null)
    setPhotoPreview(null)
    setSaveError(null)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Ukuran file foto maksimal 2 MB.')
      return
    }
    setSaveError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    setSaveError(null)
    setSaveSuccess(null)

    if (!editForm.name.trim()) {
      setSaveError('Nama lengkap wajib diisi.')
      setSaveLoading(false)
      return
    }
    if (!editForm.email.trim()) {
      setSaveError('Alamat email wajib diisi.')
      setSaveLoading(false)
      return
    }

    try {
      const finalKtpAddress = sameAddress
        ? editForm.residential_address
        : editForm.ktp_address

      let payload
      if (photoFile) {
        payload = new FormData()
        payload.append('name', editForm.name.trim())
        payload.append('email', editForm.email.trim())
        payload.append('phone_number', editForm.phone_number?.trim() || '')
        payload.append('job_category', editForm.job_category)
        payload.append('institution_name', editForm.institution_name?.trim() || '')
        payload.append('place_of_birth', editForm.place_of_birth?.trim() || '')
        payload.append('date_of_birth', editForm.date_of_birth || '')
        payload.append('residential_address', editForm.residential_address?.trim() || '')
        payload.append('ktp_address', finalKtpAddress?.trim() || '')
        payload.append('photo', photoFile)
      } else {
        payload = {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone_number: editForm.phone_number?.trim() || null,
          job_category: editForm.job_category,
          institution_name: editForm.institution_name?.trim() || null,
          place_of_birth: editForm.place_of_birth?.trim() || null,
          date_of_birth: editForm.date_of_birth || null,
          residential_address: editForm.residential_address?.trim() || null,
          ktp_address: finalKtpAddress?.trim() || null,
        }
      }

      const res = await updateProfile(payload)
      if (res?.data) {
        setProfileData(res.data)
        const token = localStorage.getItem('atlas_token')
        login(res.data, token)
        setSaveSuccess('Data profil Anda berhasil diperbarui!')
        setIsEditing(false)
        setPhotoFile(null)
        setPhotoPreview(null)
      }
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan perubahan data profil.')
    } finally {
      setSaveLoading(false)
    }
  }

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
  const name = isEditing ? editForm.name || profileData?.name || 'Anggota ATLAS' : profileData?.name || 'Anggota ATLAS'
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
  const rawPhoto = photoPreview || profileData?.photo_url || profileData?.photo_path || profileData?.avatar || null
  const photo = resolvePhotoUrl(rawPhoto)

  const handleDownloadKta = async (side) => {
    try {
      setDownloadingSide(side)
      await downloadKtaImage({
        side,
        memberNo,
        name,
        photo,
        createdAt: profileData?.created_at,
        locationName: 'Perpustakaan Daerah',
      })
    } catch (err) {
      console.error('Failed to download KTA image:', err)
      alert('Gagal mengunduh gambar KTA. Silakan coba lagi.')
    } finally {
      setDownloadingSide(null)
    }
  }

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
            {/* Card Biodata (Mode Tampil & Mode Edit Langsung) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 transition-all">
              {/* Header Card Biodata */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#002B66] flex items-center justify-center font-bold">
                    {isEditing ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#032360]">
                      {isEditing ? 'Edit Data Diri Anggota' : 'Data Diri Anggota'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isEditing
                        ? 'Perbarui informasi identitas Anda langsung dari halaman profil'
                        : 'Informasi identitas resmi sesuai database perpustakaan'}
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002B66] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-blue-200/60"
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
                ) : (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Batal</span>
                  </button>
                )}
              </div>

              {/* Banner Notifikasi Sukses */}
              {saveSuccess && !isEditing && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✓</span>
                    <span>{saveSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSaveSuccess(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Banner Notifikasi Error */}
              {saveError && isEditing && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{saveError}</span>
                </div>
              )}

              {/* MODE 1: TAMPIL BIODATA (Bukan sedang mengedit) */}
              {!isEditing ? (
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
              ) : (
                /* MODE 2: FORM EDIT BIODATA LANGSUNG */
                <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                  {/* Bagian Ubah Pasfoto (Proporsi 2:3) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 aspect-[2/3] rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-md shrink-0 flex items-center justify-center">
                      {photo ? (
                        <img src={photo} alt={name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <label
                          htmlFor="photo-file-input"
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#002B66] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{photoFile ? 'Ganti Foto Terpilih' : 'Unggah Pasfoto Baru (2:3)'}</span>
                        </label>
                        <input
                          id="photo-file-input"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />

                        {photoFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoFile(null)
                              setPhotoPreview(null)
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                          >
                            Batalkan Foto
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Format JPG, PNG, atau WebP (maks. 2MB). Foto berformat pasfoto 2:3 dan otomatis tampil pada Kartu Anggota (KTA).
                      </p>
                    </div>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama Lengkap */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Nomor Anggota (Read Only) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Nomor Anggota</label>
                        <span className="text-[10px] text-slate-400 font-medium">Terkunci otomatis</span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={memberNo}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono font-bold cursor-not-allowed outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Alamat Email *</label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="contoh@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Nomor WhatsApp / HP */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Nomor WhatsApp / HP</label>
                      <input
                        type="tel"
                        value={editForm.phone_number}
                        onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                        placeholder="081234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Kategori Pekerjaan */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kategori Pekerjaan</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['UMUM', 'PELAJAR', 'MAHASISWA'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, job_category: cat })}
                            className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                              editForm.job_category === cat
                                ? 'bg-[#002B66] text-white border-[#002B66] shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nama Instansi / Sekolah */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Nama Instansi / Sekolah</label>
                      <input
                        type="text"
                        value={editForm.institution_name}
                        onChange={(e) => setEditForm({ ...editForm, institution_name: e.target.value })}
                        placeholder="Contoh: Universitas Pendidikan Ganesha"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Tempat Lahir */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Tempat Lahir</label>
                      <input
                        type="text"
                        value={editForm.place_of_birth}
                        onChange={(e) => setEditForm({ ...editForm, place_of_birth: e.target.value })}
                        placeholder="Kota/Kabupaten lahir"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Tanggal Lahir */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={editForm.date_of_birth}
                        onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Alamat Tempat Tinggal */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700">Alamat Tempat Tinggal Saat Ini</label>
                      <textarea
                        rows="2"
                        value={editForm.residential_address}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditForm({
                            ...editForm,
                            residential_address: val,
                            ...(sameAddress ? { ktp_address: val } : {}),
                          })
                        }}
                        placeholder="Masukkan alamat domisili saat ini..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {/* Alamat KTP */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Alamat Sesuai KTP</label>
                        <label className="flex items-center gap-1.5 text-[11px] text-[#002B66] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAddress}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setSameAddress(checked)
                              if (checked) {
                                setEditForm({
                                  ...editForm,
                                  ktp_address: editForm.residential_address,
                                })
                              }
                            }}
                            className="rounded text-[#002B66] focus:ring-[#002B66]"
                          />
                          <span>Sama dengan alamat tinggal</span>
                        </label>
                      </div>
                      <textarea
                        rows="2"
                        disabled={sameAddress}
                        value={sameAddress ? editForm.residential_address : editForm.ktp_address}
                        onChange={(e) => setEditForm({ ...editForm, ktp_address: e.target.value })}
                        placeholder="Masukkan alamat sesuai kartu identitas (KTP)..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-[#002B66] focus:border-transparent outline-none transition-all ${
                          sameAddress ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Tombol Aksi Simpan & Batal */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={cancelEditing}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saveLoading ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Simpan Perubahan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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

      {/* 5. Modal Unduh KTA Gambar (PNG) */}
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Unduh Kartu Tanda Anggota (KTA)</h3>
                  <p className="text-xs text-blue-200">Simpan kartu anggota dalam format gambar (PNG) berkualitas tinggi</p>
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
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#002B66]" />
                    <span>Sisi Depan (Identitas & Pasfoto 2:3)</span>
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
                  <button
                    type="button"
                    disabled={downloadingSide !== null}
                    onClick={() => handleDownloadKta('depan')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#002B66] font-bold text-xs border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{downloadingSide === 'depan' ? 'Menyiapkan Gambar...' : 'Unduh Sisi Depan (PNG)'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Sisi Belakang (Tata Tertib)</span>
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                    <KtaBack />
                  </div>
                  <button
                    type="button"
                    disabled={downloadingSide !== null}
                    onClick={() => handleDownloadKta('belakang')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#002B66] font-bold text-xs border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{downloadingSide === 'belakang' ? 'Menyiapkan Gambar...' : 'Unduh Sisi Belakang (PNG)'}</span>
                  </button>
                </div>
              </div>

              {/* Informasi & Petunjuk Unduh Gambar */}
              <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-4 space-y-2 text-xs text-blue-950">
                <div className="font-bold flex items-center gap-2 text-[#002B66]">
                  <svg className="w-4 h-4 text-[#002B66]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Informasi Berkas Gambar KTA:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>
                    Kartu diunduh langsung dalam format <strong>gambar PNG resolusi tinggi (1004 × 636 piksel)</strong> tanpa dialog PDF peramban.
                  </li>
                  <li>
                    Pasfoto ditampilkan rapi dalam proporsi standar <strong>2:3 portrait</strong>.
                  </li>
                  <li>
                    Garis barcode dibuat presisi dan jelas agar dapat langsung dipindai oleh barcode scanner di perpustakaan.
                  </li>
                  <li>
                    Berkas gambar ini siap dicetak langsung pada kertas PVC card atau disimpan di galeri smartphone Anda.
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
                Tutup
              </button>
              <button
                type="button"
                disabled={downloadingSide !== null}
                onClick={() => handleDownloadKta('keduanya')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>{downloadingSide === 'keduanya' ? 'Menyiapkan Gambar...' : 'Unduh Kedua Sisi Sekaligus (PNG)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
