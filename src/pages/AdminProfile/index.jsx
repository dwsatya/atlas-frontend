import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Check,
  Clock,
  Info,
  BadgeCheck,
  Sliders,
  BookOpen,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import {
  fetchAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from '../../services/api'

export default function AdminProfile() {
  const navigate = useNavigate()
  const { user, login, token } = useAuth()

  // State Profile Info
  const [profileData, setProfileData] = useState(user || null)
  const [loading, setLoading] = useState(false)

  // Ref untuk mendeteksi apakah form sedang aktif diedit oleh user
  // Mencegah penimpaan input username/nama/email oleh sync/fetch berkala
  const isFormDirty = useRef(false)

  // Active Tab: 'account' | 'password' | 'permissions'
  const [activeTab, setActiveTab] = useState('account')

  // Form Edit Profil & Username
  const [formProfile, setFormProfile] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  // Form Ganti Password
  const [formPassword, setFormPassword] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('')
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('')

  // Ambil data profil dari backend (hanya saat mount dan manual refresh)
  const loadProfile = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const res = await fetchAdminProfile()
      if (res?.data) {
        setProfileData(res.data)
        // Hanya update input form jika form belum pernah diubah/diketik oleh user
        if (!isFormDirty.current) {
          setFormProfile({
            name: res.data.name || '',
            username: res.data.username || '',
            email: res.data.email || '',
          })
        }
      }
    } catch (err) {
      console.warn('Gagal memuat profil admin dari API:', err)
      if (user && !isFormDirty.current) {
        setProfileData(user)
        setFormProfile({
          name: user.name || '',
          username: user.username || '',
          email: user.email || '',
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Load HANYA sekali pada initial mount tanpa dependency yang menyebabkan loop
  useEffect(() => {
    loadProfile()
  }, [])

  // Tombol Refresh manual dari UI
  const handleManualRefresh = async () => {
    if (isFormDirty.current) {
      const confirmReset = window.confirm(
        'Anda memiliki perubahan form yang belum disimpan. Apakah Anda yakin ingin memuat ulang data dari server?'
      )
      if (!confirmReset) return
    }
    isFormDirty.current = false
    await loadProfile(false)
  }

  // Handle Simpan Profil & Username
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSuccessMsg('')
    setProfileErrorMsg('')

    if (!formProfile.name.trim()) {
      setProfileErrorMsg('Nama lengkap admin tidak boleh kosong.')
      return
    }
    if (!formProfile.username.trim()) {
      setProfileErrorMsg('Username admin tidak boleh kosong.')
      return
    }
    if (formProfile.username.length < 3) {
      setProfileErrorMsg('Username minimal harus 3 karakter.')
      return
    }
    if (!formProfile.email.trim() || !formProfile.email.includes('@')) {
      setProfileErrorMsg('Alamat email valid wajib diisi.')
      return
    }

    try {
      setSavingProfile(true)
      const res = await updateAdminProfile({
        name: formProfile.name.trim(),
        username: formProfile.username.trim(),
        email: formProfile.email.trim(),
      })

      if (res?.success) {
        isFormDirty.current = false
        setProfileSuccessMsg('Profil dan username administrator berhasil diperbarui.')
        if (res.data) {
          setProfileData(res.data)
          setFormProfile({
            name: res.data.name || '',
            username: res.data.username || '',
            email: res.data.email || '',
          })
          login(res.data, token || localStorage.getItem('atlas_token'))
        }
      } else {
        setProfileErrorMsg(res?.message || 'Gagal memperbarui profil.')
      }
    } catch (err) {
      console.error('Error saat update profil admin:', err)
      setProfileErrorMsg(err?.message || 'Terjadi kesalahan saat menyimpan perubahan profil.')
    } finally {
      setSavingProfile(false)
    }
  }

  // 4 Syarat Validasi Kata Sandi Admin
  const pwdValidation = {
    minLength: (formPassword.password || '').length >= 8,
    hasUpper: /[A-Z]/.test(formPassword.password || ''),
    hasNumber: /[0-9]/.test(formPassword.password || ''),
    hasSpecial: /[^A-Za-z0-9]/.test(formPassword.password || ''),
  }

  const isPasswordCriteriaFulfilled =
    pwdValidation.minLength &&
    pwdValidation.hasUpper &&
    pwdValidation.hasNumber &&
    pwdValidation.hasSpecial

  // Handle Ganti Password
  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordSuccessMsg('')
    setPasswordErrorMsg('')

    if (!formPassword.current_password) {
      setPasswordErrorMsg('Password lama (saat ini) wajib diisi.')
      return
    }
    if (!formPassword.password) {
      setPasswordErrorMsg('Password baru wajib diisi.')
      return
    }
    if (!pwdValidation.minLength) {
      setPasswordErrorMsg('Password baru minimal 8 karakter.')
      return
    }
    if (!pwdValidation.hasUpper) {
      setPasswordErrorMsg('Password baru harus memuat minimal 1 huruf besar (kapital A-Z).')
      return
    }
    if (!pwdValidation.hasNumber) {
      setPasswordErrorMsg('Password baru harus memuat minimal 1 angka (0-9).')
      return
    }
    if (!pwdValidation.hasSpecial) {
      setPasswordErrorMsg('Password baru harus memuat minimal 1 karakter unik / simbol (!@#$%^&* dll).')
      return
    }
    if (formPassword.password !== formPassword.password_confirmation) {
      setPasswordErrorMsg('Konfirmasi password baru tidak cocok dengan password baru.')
      return
    }

    try {
      setSavingPassword(true)
      const res = await updateAdminPassword({
        current_password: formPassword.current_password,
        password: formPassword.password,
        password_confirmation: formPassword.password_confirmation,
      })

      if (res?.success) {
        setPasswordSuccessMsg('Kata sandi administrator berhasil diperbarui.')
        setFormPassword({
          current_password: '',
          password: '',
          password_confirmation: '',
        })
      } else {
        setPasswordErrorMsg(res?.message || 'Gagal mengubah kata sandi.')
      }
    } catch (err) {
      console.error('Error saat ganti password admin:', err)
      setPasswordErrorMsg(
        err?.data?.message ||
        err?.message ||
        'Gagal memperbarui kata sandi. Pastikan password lama Anda benar.'
      )
    } finally {
      setSavingPassword(false)
    }
  }

  // Indikator kekuatan password baru
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Kosong', color: 'bg-slate-200' }
    let met = 0
    if (pwd.length >= 8) met += 1
    if (/[A-Z]/.test(pwd)) met += 1
    if (/[0-9]/.test(pwd)) met += 1
    if (/[^A-Za-z0-9]/.test(pwd)) met += 1
    if (pwd.length >= 12) met += 1

    if (met <= 2) return { score: 1, text: 'Lemah', color: 'bg-rose-500' }
    if (met <= 4) return { score: 2, text: 'Sedang (Belum Lengkap)', color: 'bg-amber-500' }
    return { score: 3, text: 'Kuat & Memenuhi Syarat', color: 'bg-emerald-500' }
  }

  const pwdStrength = calculatePasswordStrength(formPassword.password)
  const displayRole = profileData?.role || user?.role || 'Administrator'

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Breadcrumb & Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link to="/dashboard" className="hover:text-[#0B2256] transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#0B2256] font-bold">Profil Admin</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2256] tracking-tight">
                Profil &amp; Keamanan Akun Administrator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola kredensial akun, pembaruan username login, serta proteksi kata sandi sistem perpustakaan.
            </p>
          </div>

          {/* Quick Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Perbarui data profil dari server"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Menyinkronkan...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'account'
              ? 'border-[#0B2256] text-[#0B2256]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Informasi &amp; Username</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'password'
              ? 'border-[#0B2256] text-[#0B2256]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Kata Sandi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'permissions'
              ? 'border-[#0B2256] text-[#0B2256]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Shield className="w-4 h-4" />
            <span>Hak Akses &amp; Otoritas</span>
          </button>
        </div>

        {/* Tab 1: Ubah Profil & Username */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Ubah Data Administrator &amp; Username
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Username digunakan untuk login ke portal admin dan pencatatan audit log katalog/koleksi.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <User className="w-5 h-5" />
                </div>
              </div>

              {/* Alert Feedback Messages */}
              {profileSuccessMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Berhasil!</span> {profileSuccessMsg}
                  </div>
                </div>
              )}

              {profileErrorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Perhatian!</span> {profileErrorMsg}
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <AtSign className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formProfile.username}
                      onChange={(e) => {
                        isFormDirty.current = true
                        setFormProfile((prev) => ({
                          ...prev,
                          username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                        }))
                      }}
                      placeholder="contoh: admin_satya"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2256]/20 focus:border-[#0B2256] transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gunakan huruf kecil, angka, titik (.), strip (-), atau garis bawah (_). Minimal 3 karakter.
                  </p>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap Administrator <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formProfile.name}
                      onChange={(e) => {
                        isFormDirty.current = true
                        setFormProfile((prev) => ({ ...prev, name: e.target.value }))
                      }}
                      placeholder="Nama lengkap staf"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2256]/20 focus:border-[#0B2256] transition-all"
                    />
                  </div>
                </div>

                {/* Email Dinas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email Resmi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={formProfile.email}
                      onChange={(e) => {
                        isFormDirty.current = true
                        setFormProfile((prev) => ({ ...prev, email: e.target.value }))
                      }}
                      placeholder="admin@buleleng.go.id"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2256]/20 focus:border-[#0B2256] transition-all"
                    />
                  </div>
                </div>

                {/* Role / Jabatan (Read-Only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Peran &amp; Hak Akses (Role)
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-between">
                      <span className="capitalize">{displayRole}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2256] hover:bg-[#103078] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-950/10 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Side Information Card (1 col) */}
            <div className="space-y-5">
              {/* Card Panduan Keamanan Akun */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h4>Aturan Username Admin</h4>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                  <li>Username harus unik dan belum digunakan staf lain.</li>
                  <li>Username digunakan saat login dan tercatat di riwayat mutasi buku.</li>
                  <li>Gunakan huruf kecil, angka, titik (.), strip (-), atau garis bawah (_).</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ganti Password */}
        {activeTab === 'password' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Perbarui Kata Sandi (Password)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pastikan password baru Anda kuat dan memenuhi seluruh standar keamanan sistem perpustakaan.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>

              {/* Feedback Alerts */}
              {passwordSuccessMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Sukses!</span> {passwordSuccessMsg}
                  </div>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Gagal Memperbarui Password:</span> {passwordErrorMsg}
                  </div>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-5">
                {/* Password Saat Ini */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi Lama (Saat Ini) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      value={formPassword.current_password}
                      onChange={(e) =>
                        setFormPassword((prev) => ({
                          ...prev,
                          current_password: e.target.value,
                        }))
                      }
                      placeholder="Ketik password lama Anda"
                      required
                      className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2256]/20 focus:border-[#0B2256] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword.current ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      value={formPassword.password}
                      onChange={(e) =>
                        setFormPassword((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Minimal 8 karakter, huruf besar, angka, dan simbol"
                      required
                      className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2256]/20 focus:border-[#0B2256] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Checklist 4 Syarat Validasi Sandi Admin */}
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <span className="font-semibold text-slate-700 block text-[11.5px]">
                      Kriteria Wajib Kata Sandi Administrator:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${pwdValidation.minLength
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-500'
                          }`}
                      >
                        {pwdValidation.minLength ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                        )}
                        <span>Minimal 8 karakter</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${pwdValidation.hasUpper
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-500'
                          }`}
                      >
                        {pwdValidation.hasUpper ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                        )}
                        <span>Minimal 1 huruf besar (A-Z)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${pwdValidation.hasNumber
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-500'
                          }`}
                      >
                        {pwdValidation.hasNumber ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                        )}
                        <span>Minimal 1 angka (0-9)</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 transition-colors ${pwdValidation.hasSpecial
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-500'
                          }`}
                      >
                        {pwdValidation.hasSpecial ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                        )}
                        <span>Minimal 1 karakter unik / simbol</span>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {formPassword.password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Kekuatan Sandi:</span>
                        <span
                          className={`font-semibold ${pwdStrength.score === 1
                            ? 'text-rose-600'
                            : pwdStrength.score === 2
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                            }`}
                        >
                          {pwdStrength.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'
                            } ${pwdStrength.score === 1
                              ? 'w-1/3'
                              : pwdStrength.score === 2
                                ? 'w-2/3'
                                : 'w-full'
                            }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={formPassword.password_confirmation}
                      onChange={(e) =>
                        setFormPassword((prev) => ({
                          ...prev,
                          password_confirmation: e.target.value,
                        }))
                      }
                      placeholder="Ulangi kata sandi baru"
                      required
                      className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B2256]/20 focus:border-[#0B2256] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Match Indicator */}
                  {formPassword.password_confirmation && (
                    <div className="mt-1.5 text-[11px] flex items-center gap-1.5">
                      {formPassword.password === formPassword.password_confirmation ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Konfirmasi kata sandi cocok.
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Kata sandi belum cocok.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-900/10 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {savingPassword ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Memperbarui Sandi...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Perbarui Kata Sandi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar Security Guidelines */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <h4>Standar Keamanan Sandi</h4>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <p className="leading-relaxed">
                    Sistem ATLAS menggunakan enkripsi <strong>Bcrypt Hash</strong> berlapis untuk melindungi kredensial Anda dari serangan siber.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/70">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Minimal 8 karakter</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Minimal 1 huruf besar (kapital)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Minimal 1 digit angka</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Minimal 1 karakter unik / simbol</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/60 rounded-2xl border border-blue-200/70 p-5 text-blue-900 text-xs">
                <h5 className="font-bold flex items-center gap-1.5 text-blue-950 mb-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Penting: Komputer Bersama
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  Jika Anda menggunakan komputer meja layanan sirkulasi atau ruang baca bersama staf lain, selalu pastikan untuk melakukan <strong>Logout</strong> setelah selesai bertugas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hak Akses & Ringkasan Otoritas */}
        {activeTab === 'permissions' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Ringkasan Matriks Hak Akses Administrator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian modul dan wewenang yang diberikan kepada akun Anda dalam sistem otomasi perpustakaan.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B2256] text-white">
                {displayRole.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Modul 1: Katalog & Koleksi */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0B2256] flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Katalog &amp; Eksemplar
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Entri katalog Marc/RDA, cetak barcode, kurasi status eksemplar, dan karantina buku rusak.
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Akses Penuh
                </span>
              </div>

              {/* Modul 2: Sirkulasi */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Sirkulasi &amp; Peminjaman
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Validasi peminjaman anggota, perpanjangan masa pinjam, denda keterlambatan, dan pengembalian.
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Akses Penuh
                </span>
              </div>

              {/* Modul 3: Buku Tamu & Loker */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Loker &amp; Presensi
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Pencatatan kunjungan ruang baca, tamu rombongan, dan manajemen kunci loker pengunjung.
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Akses Penuh
                </span>
              </div>

              {/* Modul 4: KTA & Anggota */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all shadow-2xs">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">
                  Keanggotaan Publik
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Verifikasi pendaftaran anggota publik, cetak kartu anggota (KTA), dan monitoring sanksi.
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> Administrator
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
