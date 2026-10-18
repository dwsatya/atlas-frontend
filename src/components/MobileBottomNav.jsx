import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  LayoutGrid,
  BookOpen,
  User,
  HelpCircle,
  X,
  BookMarked,
  RotateCcw,
  BookPlus,
  CheckCircle2,
  ChevronRight,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/Logo.png'

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // State pop up & active service modal
  const [isLayananOpen, setIsLayananOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'baca' | 'pengembalian' | 'usulan' | null

  // Form state for Presensi Baca di Tempat
  const [bacaForm, setBacaForm] = useState({
    name: user?.name || '',
    identifier: user?.member_no || '',
    institution: user?.institution || '',
    category: 'Buku Teks / Monograf Umum',
  })
  const [bacaSuccess, setBacaSuccess] = useState(false)

  // Form state for Cek Pengembalian
  const [searchLoanQuery, setSearchLoanQuery] = useState(user?.member_no || '')
  const [loanResult, setLoanResult] = useState(null)

  // Form state for Usulan Buku
  const [usulanForm, setUsulanForm] = useState({
    title: '',
    author: '',
    publisher: '',
    year: '',
    notes: '',
  })
  const [usulanSuccess, setUsulanSuccess] = useState(false)

  // Authentication check
  const token = typeof window !== 'undefined' ? localStorage.getItem('atlas_token') : null
  const isAuthenticated = Boolean(user || token)

  // Route active states
  const isHomeActive = location.pathname === '/' || location.pathname === '/landing'
  const isOpacActive =
    location.pathname.startsWith('/opac') ||
    location.pathname.startsWith('/katalog') ||
    location.pathname.startsWith('/books') ||
    location.pathname.startsWith('/buku') ||
    location.pathname.startsWith('/detail-buku')
  const isProfileActive =
    location.pathname.startsWith('/profile') || location.pathname.startsWith('/profil')
  const isPanduanActive = location.pathname.startsWith('/panduan')

  // Handle Baca Ditempat submit
  const handleBacaSubmit = (e) => {
    e.preventDefault()
    if (!bacaForm.name.trim()) return
    setBacaSuccess(true)
    setTimeout(() => {
      setBacaSuccess(false)
      setActiveModal(null)
    }, 1800)
  }

  // Handle Cek Pengembalian submit
  const handleCekLoanSubmit = (e) => {
    e.preventDefault()
    const q = searchLoanQuery.trim()
    if (!q) return

    // Simulasi hasil pengecekan peminjaman & pengembalian buku
    setLoanResult({
      member_name: user?.name || 'Anggota Terdaftar',
      member_no: q.toUpperCase(),
      borrowed_books: [
        {
          title: 'Epistemologi Studi Islam Kontemporer',
          barcode: 'BC-20260901-0001',
          borrow_date: '12 Okt 2026',
          due_date: '19 Okt 2026',
          status: 'Mendekati Jatuh Tempo',
          status_type: 'warning',
          days_left: 1,
        },
      ],
      fine: 0,
    })
  }

  // Handle Usulan Buku submit
  const handleUsulanSubmit = (e) => {
    e.preventDefault()
    if (!usulanForm.title.trim()) return
    setUsulanSuccess(true)
    setTimeout(() => {
      setUsulanSuccess(false)
      setActiveModal(null)
      setUsulanForm({ title: '', author: '', publisher: '', year: '', notes: '' })
    }, 1800)
  }

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FLOATING BOTTOM NAVIGATION DOCK (MOBILE ONLY)          */}
      {/* ========================================================= */}
      <div className="fixed bottom-4 inset-x-0 mx-auto w-[92%] max-w-[400px] z-50 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <nav
          aria-label="Navigasi Bawah Ponsel"
          className="bg-white rounded-[32px] shadow-[0_12px_36px_rgba(0,35,92,0.16)] border border-slate-100/90 px-2 py-1.5 flex items-center justify-between"
        >
          {/* Tab 1: Beranda */}
          <button
            type="button"
            onClick={() => {
              setIsLayananOpen(false)
              navigate('/')
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isHomeActive && !isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Home className={`w-5 h-5 ${isHomeActive && !isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isHomeActive && !isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Beranda
            </span>
          </button>

          {/* Tab 2: Layanan (Membuka Pop-up Layanan Mandiri) */}
          <button
            type="button"
            onClick={() => setIsLayananOpen(!isLayananOpen)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <LayoutGrid className={`w-5 h-5 ${isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Layanan
            </span>
          </button>

          {/* Tab 3: OPAC (Tombol Lingkaran Menonjol di Tengah - Fitur Utama) */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <button
              type="button"
              onClick={() => {
                setIsLayananOpen(false)
                navigate('/opac')
              }}
              className="relative -top-6 flex flex-col items-center cursor-pointer group"
              title="Katalog OPAC"
            >
              <div
                className={`w-16 h-16 rounded-full bg-white flex items-center justify-center border-[3.5px] ${isOpacActive
                  ? 'border-[#0A2567] shadow-[0_10px_25px_rgba(10,37,103,0.25)] ring-2 ring-[#0A2567]/15'
                  : 'border-slate-100 shadow-[0_10px_25px_rgba(0,35,92,0.18)]'
                  } transition-all duration-200 group-active:scale-95`}
              >
                <img
                  src={logo}
                  alt="Logo OPAC"
                  className="w-8 h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>
              <span
                className={`text-[11px] leading-tight mt-1.5 ${isOpacActive ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                  }`}
              >
                OPAC
              </span>
            </button>
          </div>

          {/* Tab 4: Profil */}
          <button
            type="button"
            onClick={() => {
              setIsLayananOpen(false)
              navigate(isAuthenticated ? '/profile' : '/login')
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isProfileActive && !isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <User className={`w-5 h-5 ${isProfileActive && !isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isProfileActive && !isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Profil
            </span>
          </button>

          {/* Tab 5: Panduan */}
          <button
            type="button"
            onClick={() => {
              setIsLayananOpen(false)
              navigate('/panduan')
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-transform active:scale-95"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPanduanActive && !isLayananOpen
                ? 'bg-[#EBF2FE] text-[#0A2567]'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <HelpCircle className={`w-5 h-5 ${isPanduanActive && !isLayananOpen ? 'stroke-[2.4]' : 'stroke-[2]'}`} />
            </div>
            <span
              className={`text-[11px] leading-tight transition-colors ${isPanduanActive && !isLayananOpen ? 'font-bold text-[#0A2567]' : 'font-medium text-slate-600'
                }`}
            >
              Panduan
            </span>
          </button>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* 2. POP UP PILIHAN LAYANAN MANDIRI                         */}
      {/* ========================================================= */}
      {isLayananOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-3 pb-24 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsLayananOpen(false)}
        >
          <div
            className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-250 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar & Header */}
            <div>
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00255c] flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2256]">Layanan Mandiri</h3>
                    <p className="text-[11px] text-slate-500">Pilih layanan digital yang ingin Anda akses</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLayananOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Pilihan Layanan */}
            <div className="space-y-2.5 pt-1">
              {/* Opsi 1: Baca Ditempat */}
              <button
                type="button"
                onClick={() => {
                  setIsLayananOpen(false)
                  setActiveModal('baca')
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition-all text-left cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookMarked className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2256] group-hover:text-blue-700 transition-colors">
                      Baca Ditempat
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Presensi digital & kunjungan baca di ruang perpustakaan
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Opsi 2: Cek Pengembalian */}
              <button
                type="button"
                onClick={() => {
                  setIsLayananOpen(false)
                  setActiveModal('pengembalian')
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition-all text-left cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2256] group-hover:text-emerald-700 transition-colors">
                      Cek Pengembalian
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Periksa batas waktu tempo & denda pinjaman buku
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Opsi 3: Usulan Pengadaan Buku */}
              <button
                type="button"
                onClick={() => {
                  setIsLayananOpen(false)
                  setActiveModal('usulan')
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 transition-all text-left cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookPlus className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2256] group-hover:text-amber-700 transition-colors">
                      Usulan Pengadaan Buku
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Rekomendasikan judul buku baru untuk koleksi perpustakaan
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL DETAIL LAYANAN (BACA DITEMPAT)                   */}
      {/* ========================================================= */}
      {activeModal === 'baca' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2256]">Presensi Baca Ditempat</h3>
                  <p className="text-[10.5px] text-slate-500">Kunjungan ruang baca perpustakaan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bacaSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-slate-800">Presensi Berhasil Dicatat!</h4>
                <p className="text-xs text-slate-500">
                  Selamat membaca dan memanfaatkan fasilitas ruang baca perpustakaan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBacaSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Pengunjung / Anggota <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bacaForm.name}
                    onChange={(e) => setBacaForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor Anggota / No. KTP
                  </label>
                  <input
                    type="text"
                    value={bacaForm.identifier}
                    onChange={(e) => setBacaForm((prev) => ({ ...prev, identifier: e.target.value }))}
                    placeholder="Contoh: BLL-2026-0001 (opsional)"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Instansi / Sekolah / Umum
                  </label>
                  <input
                    type="text"
                    value={bacaForm.institution}
                    onChange={(e) => setBacaForm((prev) => ({ ...prev, institution: e.target.value }))}
                    placeholder="Contoh: Undiksha / Masyarakat Umum"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kategori Koleksi yang Dibaca
                  </label>
                  <select
                    value={bacaForm.category}
                    onChange={(e) => setBacaForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="Buku Teks / Monograf Umum">Buku Teks / Monograf Umum</option>
                    <option value="Koleksi Referensi / Ensiklopedia">Koleksi Referensi / Ensiklopedia</option>
                    <option value="Manuskrip / Bali Klasik (Gedong Kirtya)">Manuskrip / Bali Klasik</option>
                    <option value="Majalah & Terbitan Berkala">Majalah & Terbitan Berkala</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#00255c] hover:bg-[#001c47] text-white font-bold text-xs cursor-pointer shadow-sm transition active:scale-95"
                  >
                    Simpan Presensi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL DETAIL LAYANAN (CEK PENGEMBALIAN)                 */}
      {/* ========================================================= */}
      {activeModal === 'pengembalian' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2256]">Cek Pengembalian</h3>
                  <p className="text-[10.5px] text-slate-500">Status pinjaman &amp; denda buku</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  setLoanResult(null)
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCekLoanSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Anggota / Barcode Kartu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={searchLoanQuery}
                    onChange={(e) => setSearchLoanQuery(e.target.value)}
                    placeholder="Contoh: BLL-2026-0001"
                    className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Cek</span>
                  </button>
                </div>
              </div>

              {loanResult ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-bold text-xs text-[#0B2256]">{loanResult.member_name}</h4>
                      <p className="text-[10px] font-mono text-slate-500">{loanResult.member_no}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </div>

                  {loanResult.borrowed_books?.map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
                      <p className="font-bold text-[11px] text-slate-800 leading-snug">{b.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Tempo: {b.due_date}</span>
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                          {b.status} ({b.days_left} hari lagi)
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                    <span>Estimasi Denda:</span>
                    <span className="font-bold text-slate-900">
                      {loanResult.fine > 0 ? `Rp ${loanResult.fine.toLocaleString('id-ID')}` : 'Rp 0 (Tidak ada denda)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    Masukkan Nomor Kartu Anggota perpustakaan Anda untuk melihat daftar buku yang sedang dipinjam beserta jadwal tanggal pengembaliannya.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL DETAIL LAYANAN (USULAN PENGADAAN BUKU)           */}
      {/* ========================================================= */}
      {activeModal === 'usulan' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BookPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2256]">Usulan Pengadaan Buku</h3>
                  <p className="text-[10.5px] text-slate-500">Rekomendasikan judul buku baru</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {usulanSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-slate-800">Usulan Berhasil Dikirim!</h4>
                <p className="text-xs text-slate-500">
                  Terima kasih! Rekomendasi buku Anda akan ditinjau oleh tim pengadaan koleksi perpustakaan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUsulanSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={usulanForm.title}
                    onChange={(e) => setUsulanForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Sejarah Buleleng Tempo Doeloe"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pengarang / Penulis
                    </label>
                    <input
                      type="text"
                      value={usulanForm.author}
                      onChange={(e) => setUsulanForm((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Nama penulis"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Penerbit / Tahun
                    </label>
                    <input
                      type="text"
                      value={usulanForm.publisher}
                      onChange={(e) => setUsulanForm((prev) => ({ ...prev, publisher: e.target.value }))}
                      placeholder="Cth: Erlangga, 2025"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Alasan Rekomendasi / Catatan
                  </label>
                  <textarea
                    rows={2}
                    value={usulanForm.notes}
                    onChange={(e) => setUsulanForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Contoh: Buku ini sangat relevan untuk referensi mahasiswa..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-sm transition active:scale-95"
                  >
                    Kirim Usulan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
