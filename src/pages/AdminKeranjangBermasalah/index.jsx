import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  RotateCw,
  UserPlus,
  Search,
  Filter,
  CheckSquare,
  Square,
  Printer,
  Download,
  Eye,
  MessageSquare,
  AlertTriangle,
  Briefcase,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Phone,
  Building,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  SlidersHorizontal,
  BookX,
  Clock,
  UserX,
  ShieldAlert,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  fetchProblemCarts,
  bulkActionProblemCarts,
  syncCirculationProblemCarts,
} from '../../services/api'
import AddCaseModal from './AddCaseModal'
import CaseDetailModal from './CaseDetailModal'
import PrintBillModal from './PrintBillModal'
import WhatsAppNoticeModal from './WhatsAppNoticeModal'

export default function AdminKeranjangBermasalah() {
  const [searchParams] = useSearchParams()

  // State
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState([])
  const [stats, setStats] = useState(null)
  const [toast, setToast] = useState(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [problemTypeFilter, setProblemTypeFilter] = useState('ALL')
  const [jobCategoryFilter, setJobCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'BELUM_SELESAI' | 'SELESAI'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Selection
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeCaseForDetail, setActiveCaseForDetail] = useState(null)
  const [activeCaseForPrint, setActiveCaseForPrint] = useState(null)
  const [activeCaseForWa, setActiveCaseForWa] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3800)
  }

  // Load data from Backend
  const loadCases = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchProblemCarts({
        search: searchQuery,
        problem_type: problemTypeFilter,
        job_category: jobCategoryFilter,
        status: statusFilter,
        page: currentPage,
        per_page: perPage,
      })

      if (res?.data) {
        setCases(res.data.data || [])
        setTotalItems(res.data.meta?.total || res.data.total || (res.data.data || []).length)
        setTotalPages(res.data.meta?.last_page || res.data.last_page || 1)
      }
      if (res?.stats) {
        setStats(res.stats)
      }
    } catch (err) {
      console.warn('Could not load problem carts:', err)
      showToast(err.message || 'Gagal memuat data keranjang bermasalah.', 'error')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, problemTypeFilter, jobCategoryFilter, statusFilter, currentPage, perPage])

  useEffect(() => {
    loadCases()
  }, [loadCases])

  // Handle Search & Filter trigger
  const handleApplyFilter = (e) => {
    e?.preventDefault()
    setCurrentPage(1)
    loadCases()
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setProblemTypeFilter('ALL')
    setJobCategoryFilter('ALL')
    setStatusFilter('ALL')
    setCurrentPage(1)
  }

  // Selection toggles
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(cases.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const isAllSelected = useMemo(() => {
    return cases.length > 0 && selectedIds.length === cases.length
  }, [cases, selectedIds])

  // Bulk action execute
  const handleExecuteBulkAction = async () => {
    if (!bulkAction) {
      showToast('Pilih jenis tindakan massal terlebih dahulu.', 'error')
      return
    }
    if (selectedIds.length === 0) {
      showToast('Pilih setidaknya satu baris anggota bermasalah.', 'error')
      return
    }

    if (
      bulkAction === 'DELETE' &&
      !window.confirm(`Yakin ingin menghapus ${selectedIds.length} kasus terpilih dari keranjang?`)
    ) {
      return
    }

    try {
      setIsBulkProcessing(true)
      const res = await bulkActionProblemCarts(bulkAction, selectedIds)
      showToast(res?.message || 'Tindakan massal berhasil dijalankan!')
      setSelectedIds([])
      setBulkAction('')
      loadCases()
    } catch (err) {
      showToast(err.message || 'Gagal mengeksekusi tindakan massal.', 'error')
    } finally {
      setIsBulkProcessing(false)
    }
  }

  // Sync with circulation
  const handleSyncCirculation = async () => {
    try {
      setIsSyncing(true)
      const res = await syncCirculationProblemCarts()
      showToast(res?.message || 'Sinkronisasi keterlambatan & koleksi rusak sirkulasi selesai!')
      loadCases()
    } catch (err) {
      showToast(err.message || 'Gagal sinkronisasi data sirkulasi.', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  // Export CSV / Excel
  const handleExportCsv = () => {
    if (cases.length === 0) {
      showToast('Tidak ada data untuk diekspor.', 'error')
      return
    }

    const headers = [
      'No',
      'No. Anggota',
      'Nama Pemustaka',
      'Jenis Kelamin',
      'Kategori',
      'Instansi / Sekolah',
      'Nomor WhatsApp',
      'Jenis Pelanggaran',
      'Judul Koleksi / Kasus',
      'No. Panggil',
      'Eksemplar',
      'Tanggal Kasus',
      'Status Tindakan',
      'Keterangan Status',
      'Petugas Pemeriksa',
      'Status Penyelesaian',
    ]

    const rows = cases.map((c, i) => {
      const m = c.member || {}
      return [
        i + 1,
        `"${m.member_no || '-'}"`,
        `"${m.name || '-'}"`,
        `"${m.gender || 'L'}"`,
        `"${m.job_category || 'UMUM'}"`,
        `"${m.institution_name || '-'}"`,
        `"${m.phone_number || '-'}"`,
        `"${c.problem_type_label || c.problem_type}"`,
        `"${c.item_title || '-'}"`,
        `"${c.item_call_number || '-'}"`,
        `"${c.item_barcode || '-'}"`,
        `"${c.reported_date || '-'}"`,
        `"${c.is_resolved ? 'Selesai / Teratasi' : 'Akses Dibekukan'}"`,
        `"${c.action_notes || '-'}"`,
        `"${c.handled_by || '-'}"`,
        c.is_resolved ? '"Selesai"' : '"Belum Selesai"',
      ]
    })

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `Keranjang_Anggota_Bermasalah_DAPD_Buleleng_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast('Rekap keranjang anggota bermasalah berhasil diunduh (CSV / Excel)!')
  }

  // Get problem badge style (Bebas Denda Uang)
  const renderProblemBadge = (cart) => {
    const type = cart.problem_type || ''

    if (type === 'BUKU_HILANG') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-[#991B1B] text-white tracking-wide shrink-0 inline-flex items-center gap-1.5 shadow-xs">
          <BookX className="w-3.5 h-3.5 shrink-0" />
          <span>BUKU HILANG</span>
        </span>
      )
    }

    if (type === 'TELAT' || type === 'DENDA_MENUMPUK') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-[#78350F] text-white tracking-wide shrink-0 inline-flex items-center gap-1.5 shadow-xs">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{cart.late_duration_text ? cart.late_duration_text.toUpperCase() : 'TERLAMBAT KEMBALI'}</span>
        </span>
      )
    }

    if (type === 'KOLEKSI_RUSAK') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-[#713F12] text-white tracking-wide shrink-0 inline-flex items-center gap-1.5 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>KOLEKSI RUSAK / CACAT</span>
        </span>
      )
    }

    if (type === 'ANOMALI_IDENTITAS') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-[#1D4ED8] text-white tracking-wide shrink-0 inline-flex items-center gap-1.5 shadow-xs">
          <UserX className="w-3.5 h-3.5 shrink-0" />
          <span>ANOMALI NIK / GANDA</span>
        </span>
      )
    }

    return (
      <span className="px-2.5 py-1 rounded-md text-[10.5px] font-bold bg-slate-700 text-white tracking-wide shrink-0 inline-flex items-center gap-1.5 shadow-xs">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>{cart.problem_type_label || 'PELANGGARAN TATA TERTIB'}</span>
      </span>
    )
  }

  // Get Category badge style
  const renderCategoryBadge = (category) => {
    const cat = String(category || '').toUpperCase()
    if (cat.includes('PELAJAR')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
          Pelajar
        </span>
      )
    }
    if (cat.includes('MAHASISWA')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
          Mahasiswa
        </span>
      )
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0B2256]/10 text-[#0B2256] border border-[#0B2256]/20 inline-block">
        Umum / ASN
      </span>
    )
  }

  // Get Action Status Pill (Hanya Akses Dibekukan atau Selesai)
  const renderActionStatus = (cart) => {
    const subtext = cart.action_notes || ''

    if (cart.is_resolved) {
      return (
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Selesai / Teratasi
          </span>
          <p className="text-[10px] text-slate-500 mt-1">Hak pinjam dipulihkan</p>
        </div>
      )
    }

    return (
      <div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          Akses Dibekukan
        </span>
        {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2256] tracking-tight">
              Keranjang Anggota Bermasalah
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Daftar rekaman anggota perpustakaan yang ditangguhkan hak pinjamnya (Akses Dibekukan)
              karena keterlambatan pengembalian buku, buku hilang/rusak, atau pelanggaran sirkulasi
              DAPD Kabupaten Buleleng.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadCases}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Segarkan Data</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Masukkan Anggota</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Kasus Bermasalah */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  TOTAL KASUS BERMASALAH
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
                  {stats?.total_cases ?? 28}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-700" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Perlu tindak lanjut pustakawan
              </span>
              <span className="font-bold text-rose-600 text-xs font-mono">
                {stats?.total_cases ?? 28} Kasus
              </span>
            </div>
          </div>

          {/* Card 2: Kategori Umum & ASN */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  KATEGORI UMUM &amp; ASN
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
                  {stats?.umum_count ?? 7}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Masyarakat &amp; ASN Pemkab</span>
              <span className="font-bold text-blue-600 text-xs font-mono">
                {stats?.umum_percent ?? '25.0%'} total
              </span>
            </div>
          </div>

          {/* Card 3: Kategori Pelajar */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  KATEGORI PELAJAR
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
                  {stats?.pelajar_count ?? 12}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Siswa SD, SMP &amp; SMA</span>
              <span className="font-bold text-emerald-600 text-xs font-mono">
                {stats?.pelajar_percent ?? '42.9%'} total
              </span>
            </div>
          </div>

          {/* Card 4: Kategori Mahasiswa */}
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  KATEGORI MAHASISWA
                </span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
                  {stats?.mahasiswa_count ?? 9}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-teal-700" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px] truncate max-w-[170px]" title="Undiksha, Panji Sakti & STAHN">
                Undiksha, Panji Sakti &amp; STAHN
              </span>
              <span className="font-bold text-teal-600 text-xs font-mono">
                {stats?.mahasiswa_percent ?? '32.1%'} total
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
          {/* Row 1: Search, Problem Type, Job Category */}
          <form onSubmit={handleApplyFilter} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-6 space-y-1">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Pencarian Anggota Bermasalah</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari No. Anggota, Nama Lengkap, Judul Buku Tertahan, atau..."
                  className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Jenis Pelanggaran */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Jenis Pelanggaran</label>
              <select
                value={problemTypeFilter}
                onChange={(e) => {
                  setProblemTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none transition-all"
              >
                <option value="ALL">Semua Jenis Masalah ({stats?.total_cases ?? 0})</option>
                <option value="BUKU_HILANG">Buku Hilang (Menunggu Pengganti)</option>
                <option value="TELAT">Keterlambatan Pengembalian</option>
                <option value="KOLEKSI_RUSAK">Koleksi Rusak / Cacat</option>
                <option value="ANOMALI_IDENTITAS">Anomali NIK / Ganda</option>
                <option value="LAINNYA">Pelanggaran Tata Tertib</option>
              </select>
            </div>

            {/* Kategori Anggota */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Kategori Anggota</label>
              <select
                value={jobCategoryFilter}
                onChange={(e) => {
                  setJobCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none transition-all"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="UMUM">Umum &amp; ASN Pemkab</option>
                <option value="PELAJAR">Pelajar (SD, SMP, SMA)</option>
                <option value="MAHASISWA">Mahasiswa Perguruan Tinggi</option>
              </select>
            </div>
          </form>

          {/* Row 2: Status Penanganan Pills & Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                STATUS PENANGANAN:
              </span>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#0B2256] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua ({stats?.total_cases ?? 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('BELUM_SELESAI')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'BELUM_SELESAI' || statusFilter === 'AKSES_DIBEKUKAN'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'BELUM_SELESAI' || statusFilter === 'AKSES_DIBEKUKAN' ? 'bg-white' : 'bg-rose-500'}`} />
                Akses Dibekukan ({stats?.status_breakdown?.unresolved ?? 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('SELESAI')
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'SELESAI'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'SELESAI' ? 'bg-white' : 'bg-emerald-500'}`} />
                Kasus Selesai / Teratasi ({stats?.status_breakdown?.resolved ?? 0})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-4 py-1.5 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Terapkan Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Toolbar & Mass Actions */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Left: Mass Select & Action Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
              />
              <span>Pilih Semua (Halaman Ini)</span>
            </label>

            {selectedIds.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {selectedIds.length} Anggota Terpilih
              </span>
            )}

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium outline-none"
              >
                <option value="">-- Pilih Tindakan Massal --</option>
                <option value="FREEZE">Bekukan Hak Pinjam (Akses Dibekukan)</option>
                <option value="RESOLVE">Selesaikan Kasus &amp; Pulihkan ke Entri Anggota</option>
                <option value="DELETE">Hapus Kasus Terpilih</option>
              </select>
              <button
                type="button"
                disabled={isBulkProcessing || !bulkAction || selectedIds.length === 0}
                onClick={handleExecuteBulkAction}
                className="px-3.5 py-1.5 rounded-lg bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isBulkProcessing ? 'Memproses...' : 'Terapkan'}
              </button>
            </div>
          </div>

          {/* Right: Export & Sync Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSyncCirculation}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
              title="Pindai keterlambatan peminjaman & koleksi rusak otomatis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sinkron Sirkulasi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (cases.length > 0) setActiveCaseForPrint(cases[0])
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Cetak Berita Acara Pembekuan Akses Sirkulasi"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Berita Acara</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            {/* Per Page Select */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(parseInt(e.target.value))
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium outline-none bg-white"
            >
              <option value="5">5 per halaman</option>
              <option value="10">10 per halaman</option>
              <option value="25">25 per halaman</option>
              <option value="50">50 per halaman</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F1F5F9] text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3 min-w-[210px]">NO. ANGGOTA &amp; IDENTITAS</th>
                  <th className="py-3.5 px-3 min-w-[170px]">PEKERJAAN &amp; INSTANSI</th>
                  <th className="py-3.5 px-3 min-w-[280px]">JENIS PELANGGARAN &amp; DETAIL KOLEKSI</th>
                  <th className="py-3.5 px-3 min-w-[150px]">TANGGAL TERTUNDA &amp; PETUGAS</th>
                  <th className="py-3.5 px-3 min-w-[160px]">STATUS TINDAKAN</th>
                  <th className="py-3.5 px-3 w-28 text-center">AKSI CEPAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RotateCw className="w-6 h-6 animate-spin text-blue-600" />
                        <span>Memuat data keranjang anggota bermasalah...</span>
                      </div>
                    </td>
                  </tr>
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <AlertTriangle className="w-6 h-6 text-slate-300" />
                        <span className="font-semibold text-slate-600">Tidak ada data anggota bermasalah</span>
                        <span className="text-[11px] text-slate-400">
                          Cobalah sesuaikan kata kunci pencarian atau reset filter di atas.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cases.map((cart) => {
                    const member = cart.member || {}
                    const isSelected = selectedIds.includes(cart.id)
                    const rawPhone = member.phone_number || ''
                    const hasValidPhone = rawPhone && !rawPhone.includes('0000')

                    return (
                      <tr
                        key={cart.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="py-4 px-4 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(cart.id)}
                            className="rounded border-slate-300 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
                          />
                        </td>

                        {/* 2. No. Anggota & Identitas */}
                        <td className="py-4 px-3 align-middle">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-[#EBF2FE] text-[#1E56B3] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/70">
                              <User className="w-4 h-4 text-[#1E56B3]" />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs hover:text-blue-700 cursor-pointer" onClick={() => setActiveCaseForDetail(cart)}>
                                  {member.name || '-'}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                  {member.gender || 'L'} / {member.age ? `${member.age} Th` : '21 Th'}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] font-semibold text-slate-600">
                                {member.member_no || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 3. Pekerjaan & Instansi */}
                        <td className="py-4 px-3 align-middle space-y-1">
                          <div>{renderCategoryBadge(member.job_category)}</div>
                          <p className="font-medium text-slate-800 text-[11px] leading-tight">
                            {member.institution_name || '-'}
                          </p>
                          {hasValidPhone ? (
                            <p className="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{rawPhone}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>No WA Tidak Valid</span>
                            </p>
                          )}
                        </td>

                        {/* 4. Jenis Pelanggaran & Detail Koleksi */}
                        <td className="py-4 px-3 align-middle space-y-1.5">
                          {renderProblemBadge(cart)}
                          <p className="font-bold text-slate-900 text-xs leading-snug">
                            {cart.item_title || '-'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 flex-wrap">
                            {cart.item_call_number && (
                              <span>No. Panggil: {cart.item_call_number}</span>
                            )}
                            {cart.item_call_number && cart.item_barcode && <span>•</span>}
                            {cart.item_barcode && (
                              <span>Eksemplar: {cart.item_barcode}</span>
                            )}
                            {!cart.item_call_number && !cart.item_barcode && (
                              <span>{cart.description || '-'}</span>
                            )}
                          </p>
                        </td>

                        {/* 5. Tanggal Tertunda & Petugas */}
                        <td className="py-4 px-3 align-middle space-y-0.5">
                          <p className="font-semibold text-slate-900 text-[11px]">
                            {cart.reported_date_formatted || cart.reported_date || '-'}
                          </p>
                          {cart.late_duration_text && (
                            <p className="text-[11px] font-bold text-rose-600">
                              {cart.late_duration_text}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            Petugas: <span className="font-medium text-slate-700">{cart.handled_by || '-'}</span>
                          </p>
                        </td>

                        {/* 6. Status Tindakan */}
                        <td className="py-4 px-3 align-middle">
                          {renderActionStatus(cart)}
                        </td>

                        {/* 7. Aksi Cepat */}
                        <td className="py-4 px-3 align-middle text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* WhatsApp Button */}
                            <button
                              type="button"
                              onClick={() => setActiveCaseForWa(cart)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                hasValidPhone
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                              title={hasValidPhone ? 'Kirim Pesan WhatsApp Resmi' : 'Nomor HP tidak valid'}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Bill Button */}
                            <button
                              type="button"
                              onClick={() => setActiveCaseForPrint(cart)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-[#0B2256] hover:text-white border border-blue-200 transition-colors cursor-pointer"
                              title="Cetak Berita Acara Pembekuan Akses Sirkulasi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* View / Detail Button */}
                            <button
                              type="button"
                              onClick={() => setActiveCaseForDetail(cart)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white border border-slate-200 transition-colors cursor-pointer"
                              title="Lihat Detail & Kelola Riwayat Tindak Lanjut"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan {cases.length > 0 ? (currentPage - 1) * perPage + 1 : 0} -{' '}
              {Math.min(currentPage * perPage, totalItems)} dari {totalItems} Anggota Bermasalah
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#0B2256] text-white shadow-xs'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddCaseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => {
            showToast(msg)
            loadCases()
          }}
        />
      )}

      {activeCaseForDetail && (
        <CaseDetailModal
          isOpen={Boolean(activeCaseForDetail)}
          cart={activeCaseForDetail}
          onClose={() => setActiveCaseForDetail(null)}
          onUpdateSuccess={(updated) => {
            showToast('Kasus berhasil diperbarui!')
            setActiveCaseForDetail(updated)
            loadCases()
          }}
          onOpenPrint={(c) => {
            setActiveCaseForDetail(null)
            setActiveCaseForPrint(c)
          }}
          onOpenWhatsApp={(c) => {
            setActiveCaseForDetail(null)
            setActiveCaseForWa(c)
          }}
        />
      )}

      {activeCaseForPrint && (
        <PrintBillModal
          isOpen={Boolean(activeCaseForPrint)}
          cart={activeCaseForPrint}
          onClose={() => setActiveCaseForPrint(null)}
        />
      )}

      {activeCaseForWa && (
        <WhatsAppNoticeModal
          isOpen={Boolean(activeCaseForWa)}
          cart={activeCaseForWa}
          onClose={() => setActiveCaseForWa(null)}
        />
      )}
    </AdminLayout>
  )
}
