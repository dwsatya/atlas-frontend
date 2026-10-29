import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  BookCopy,
  BookOpen,
  BookOpenText,
  Brain,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Church,
  FileSpreadsheet,
  FlaskConical,
  Landmark,
  Languages,
  Laptop,
  Loader2,
  MessageCircle,
  Palette,
  Printer,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  fetchActiveLoans,
  fetchActiveLoansReport,
  exportActiveLoans,
  syncActiveLoans,
} from '../../services/api'

const TABS = [
  { key: 'all', label: 'Semua Pinjaman', statKey: 'total' },
  { key: 'overdue', label: 'Terlambat / Menunggak', statKey: 'overdue', dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700' },
  { key: 'on_time', label: 'Tepat Waktu / Aman', statKey: 'on_time', dot: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { key: 'due_today', label: 'Jatuh Tempo Hari Ini', statKey: 'due_today', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
]

const SORT_OPTIONS = [
  { value: 'due_asc', label: 'Jatuh Tempo Terdekat' },
  { value: 'due_desc', label: 'Jatuh Tempo Terjauh' },
  { value: 'loan_desc', label: 'Pinjam Terbaru' },
  { value: 'loan_asc', label: 'Pinjam Terlama' },
]

const JOB_LABELS = { MAHASISWA: 'Mahasiswa', PELAJAR: 'Pelajar', UMUM: 'Umum' }

const PER_PAGE_OPTIONS = [10, 25, 50]

// Ikon ilustrasi berdasarkan kelas utama DDC (000-900)
const DDC_ICONS = [Laptop, Brain, Church, Landmark, Languages, FlaskConical, Wrench, Palette, BookOpenText, ScrollText]

const getDdcIcon = (row) => {
  const digit = parseInt(String(row.ddc_number || row.call_number || '').trim()[0], 10)
  return Number.isNaN(digit) ? BookOpen : DDC_ICONS[digit]
}

const formatDate = (isoDate, month = 'short') =>
  isoDate
    ? new Date(`${isoDate}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' })
    : '-'

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const daysSince = (isoDate, todayKey) =>
  Math.round((new Date(`${todayKey}T00:00:00`) - new Date(`${isoDate}T00:00:00`)) / 86400000)

const formatLoanDate = (isoDate, todayKey) => {
  const diff = daysSince(isoDate, todayKey)
  if (diff === 0) return 'Hari Ini'
  if (diff === 1) return `Kemarin (${formatDate(isoDate)})`
  return formatDate(isoDate)
}

const escapeHtml = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

const buildWhatsAppUrl = (row) => {
  const digits = String(row.member.phone_number || '').replace(/\D/g, '')
  if (!digits) return null
  const phone = digits.startsWith('0') ? `62${digits.slice(1)}` : digits

  const intro = `Halo ${row.member.name}, kami dari Perpustakaan DAPD Kabupaten Buleleng.`
  const book = `buku "${row.title}" (${row.barcode_no})`
  const body =
    row.state === 'overdue'
      ? `Peminjaman ${book} telah melewati jatuh tempo ${formatDate(row.due_date, 'long')} selama ${Math.abs(row.days_left)} hari dengan estimasi denda ${formatRupiah(row.fine_estimate)}. Mohon segera dikembalikan.`
      : row.state === 'due_today'
        ? `Peminjaman ${book} jatuh tempo HARI INI. Mohon dikembalikan sebelum jam layanan berakhir.`
        : `Pengingat: peminjaman ${book} jatuh tempo pada ${formatDate(row.due_date, 'long')}.`

  return `https://wa.me/${phone}?text=${encodeURIComponent(`${intro}\n\n${body}\n\nTerima kasih.`)}`
}

const getPageNumbers = (current, last) => {
  if (last <= 5) return Array.from({ length: last }, (_, i) => i + 1)
  const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last))
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((page, idx) => (idx > 0 && page - sorted[idx - 1] > 1 ? ['…', page] : [page]))
}

function printLoanReport(rows, stats, filterLabel) {
  const body = rows
    .map(
      (row, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${escapeHtml(row.title)}</b><br/><small>${escapeHtml(row.barcode_no)} • ${escapeHtml(row.call_number || '-')}</small></td>
        <td>${escapeHtml(row.member.name)}<br/><small>${escapeHtml(row.member.member_no)}</small></td>
        <td>${escapeHtml(formatDate(row.loan_date))}</td>
        <td>${escapeHtml(formatDate(row.due_date))}</td>
        <td>${escapeHtml(row.state_label)}${row.state === 'overdue' ? ` (${Math.abs(row.days_left)} hari)` : ''}</td>
      </tr>`
    )
    .join('')

  const win = window.open('', '_blank', 'width=1000,height=700')
  if (!win) return
  win.document.write(`<!doctype html><html><head><title>Laporan Daftar Pinjaman</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;padding:24px;color:#0f172a}
      h1{font-size:16px;margin:0}p{margin:2px 0;color:#475569}
      .stats{display:flex;gap:24px;margin:12px 0}.stats b{font-size:14px;color:#0B2256}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #cbd5e1;padding:5px 6px;text-align:left;vertical-align:top}
      th{background:#EEF3FA}
    </style></head><body>
    <h1>Laporan Daftar Pinjaman Koleksi — DAPD Kabupaten Buleleng</h1>
    <p>Dicetak: ${escapeHtml(new Date().toLocaleString('id-ID'))} • Filter: ${escapeHtml(filterLabel)}</p>
    <div class="stats">
      <span>Total aktif: <b>${stats.total}</b></span>
      <span>Tepat waktu: <b>${stats.on_time}</b></span>
      <span>Jatuh tempo hari ini: <b>${stats.due_today}</b></span>
      <span>Terlambat: <b>${stats.overdue}</b></span>
    </div>
    <table>
      <thead><tr><th>No</th><th>Koleksi</th><th>Peminjam</th><th>Tgl Pinjam</th><th>Jatuh Tempo</th><th>Status</th></tr></thead>
      <tbody>${body || '<tr><td colspan="6" style="text-align:center">Tidak ada data</td></tr>'}</tbody>
    </table>
    </body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

function StatCard({ label, value, icon: Icon, iconClass, valueClass = 'text-[#0B2256]', children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold leading-none ${valueClass}`}>{formatNumber(value)}</span>
            <span className="text-xs text-slate-600">Eksemplar</span>
          </p>
        </div>
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </span>
      </div>
      <div className="flex items-center gap-2.5 text-xs text-slate-600">{children}</div>
    </div>
  )
}

export default function AdminDaftarPeminjaman() {
  const [todayKey] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })

  const [rows, setRows] = useState([])
  const [stats, setStats] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [tab, setTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [jobCategory, setJobCategory] = useState('all')
  const [date, setDate] = useState('')
  const [dateField, setDateField] = useState('loan_date')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sort, setSort] = useState('due_asc')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const [selectedIds, setSelectedIds] = useState([])
  const [busyAction, setBusyAction] = useState(null)
  const [toast, setToast] = useState(null)

  const filters = { tab, search, job_category: jobCategory, date, date_field: dateField, sort }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // Debounce input pencarian agar tidak memanggil API setiap ketikan
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const result = await fetchActiveLoans({
        tab,
        search,
        job_category: jobCategory,
        date,
        date_field: dateField,
        sort,
        per_page: perPage,
        page,
      })
      setRows(result.data)
      setStats(result.stats)
      setMeta(result.meta)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [tab, search, jobCategory, date, dateField, sort, perPage, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const handleResetFilters = () => {
    setTab('all')
    setSearchInput('')
    setSearch('')
    setJobCategory('all')
    setDate('')
    setDateField('loan_date')
    setSort('due_asc')
    setPage(1)
    setSelectedIds([])
  }

  const pageIds = rows.map((row) => row.loan_id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  const toggleSelectPage = () => {
    setSelectedIds((prev) =>
      allPageSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]
    )
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const runAction = async (key, action) => {
    setBusyAction(key)
    try {
      await action()
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setBusyAction(null)
    }
  }

  const handleExport = () =>
    runAction('export', async () => {
      await exportActiveLoans({ ...filters, ids: selectedIds })
      showToast('success', selectedIds.length ? `${selectedIds.length} transaksi terpilih diekspor.` : 'Daftar pinjaman berhasil diekspor.')
    })

  const handlePrint = () =>
    runAction('print', async () => {
      const result = await fetchActiveLoansReport({ ...filters, ids: selectedIds })
      const tabLabel = TABS.find((item) => item.key === tab)?.label
      const label = selectedIds.length ? `${selectedIds.length} transaksi terpilih` : tabLabel
      printLoanReport(result.data, result.stats, label)
    })

  const handleSync = () =>
    runAction('sync', async () => {
      const result = await syncActiveLoans()
      showToast('success', result.message)
      await loadData()
    })

  const renderPeriod = (row) => {
    const extended = row.extension_count > 0
    const dueTone = {
      overdue: 'text-rose-600',
      due_today: 'text-amber-600',
      on_time: 'text-emerald-700',
    }[row.state]
    const DueIcon = extended ? RefreshCw : row.state === 'overdue' ? CalendarX : row.state === 'due_today' ? AlertTriangle : CalendarCheck

    return (
      <div className="space-y-1 text-xs">
        <p className="flex items-start gap-1.5 text-slate-600">
          <CalendarDays className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Pinjam: {formatLoanDate(row.loan_date, todayKey)}</span>
        </p>
        <p className={`flex items-start gap-1.5 font-medium ${extended ? 'text-blue-700' : dueTone}`}>
          <DueIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            {extended ? 'Tempo Baru' : 'Tempo'}:{' '}
            {row.state === 'due_today' ? `Hari Ini (${formatDate(row.due_date)})` : formatDate(row.due_date)}
          </span>
        </p>
      </div>
    )
  }

  const renderRemaining = (row) => {
    if (row.state === 'overdue') {
      return (
        <>
          <p className="text-xs font-bold text-rose-600">Terlambat {Math.abs(row.days_left)} Hari</p>
          <p className="text-xs text-slate-600 mt-0.5">Denda {formatRupiah(row.fine_estimate)}</p>
        </>
      )
    }
    if (row.state === 'due_today') {
      return (
        <>
          <p className="text-xs font-bold text-amber-600">Hari Ini!</p>
          <p className="text-xs text-slate-600 mt-0.5">Batas jam layanan</p>
        </>
      )
    }
    const note =
      row.extension_count > 0
        ? `Perpanjangan ke-${row.extension_count}`
        : daysSince(row.loan_date, todayKey) <= 1
          ? 'Baru dipinjam'
          : 'Kondisi aman'
    return (
      <>
        <p className="text-xs font-bold text-blue-700">Sisa {row.days_left} Hari</p>
        <p className="text-xs text-slate-600 mt-0.5">{note}</p>
      </>
    )
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold max-w-sm ${
              toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="p-2 sm:p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2256] tracking-tight">Daftar Pinjaman Koleksi</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Pantau seluruh transaksi peminjaman buku yang aktif, status batas waktu pinjam, dan identifikasi
              keterlambatan koleksi secara real-time di lingkungan DAPD Kabupaten Buleleng.
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                disabled={busyAction !== null}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {busyAction === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-700" />}
                <span>Ekspor Excel</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={busyAction !== null}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {busyAction === 'print' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>Cetak Laporan</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={busyAction !== null}
              className="h-10 px-4 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${busyAction === 'sync' ? 'animate-spin' : ''}`} />
              <span>Sinkron Data</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Buku Dipinjam" value={stats?.total} icon={BookCopy} iconClass="bg-[#DCE6F7] text-[#0B2256]">
            <span className="flex items-center gap-1 font-bold text-emerald-700 shrink-0">
              <TrendingUp className="w-4 h-4" />+{formatNumber(stats?.new_today)} hari ini
            </span>
            <span>Dari total {formatNumber(stats?.total_collections)} koleksi</span>
          </StatCard>
          <StatCard
            label="Tepat Waktu / Aman"
            value={stats?.on_time}
            icon={BadgeCheck}
            iconClass="bg-emerald-100 text-emerald-700"
            valueClass="text-emerald-700"
          >
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
              {(stats?.compliance_rate ?? 0).toLocaleString('id-ID')}% Kepatuhan
            </span>
            <span>Masa pinjam aktif</span>
          </StatCard>
          <StatCard
            label="Jatuh Tempo"
            value={stats?.due_today}
            icon={BellRing}
            iconClass="bg-amber-100 text-amber-700"
            valueClass="text-amber-500"
          >
            <button
              type="button"
              onClick={() => changeFilter(setTab)('due_today')}
              className="px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold shrink-0 cursor-pointer transition-colors"
            >
              Kirim Pengingat WA
            </button>
            <span>Perlu respon hari ini</span>
          </StatCard>
          <StatCard
            label="Terlambat"
            value={stats?.overdue}
            icon={AlertTriangle}
            iconClass="bg-rose-100 text-rose-600"
            valueClass="text-rose-700"
          >
            <button
              type="button"
              onClick={() => changeFilter(setTab)('overdue')}
              className="px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold shrink-0 cursor-pointer transition-colors"
            >
              Perlu Pengembalian Segera
            </button>
            <span>Tenggat lewat batas</span>
          </StatCard>
        </div>

        {/* Filters */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => {
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeFilter(setTab)(item.key)}
                  className={`h-8 px-3.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    active ? 'bg-[#0B2256] text-white' : 'bg-[#EEF3FA] text-slate-700 hover:bg-[#DCE6F7]'
                  }`}
                >
                  {item.dot && <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />}
                  <span>{item.label}</span>
                  <span
                    className={`px-1.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : item.badge || 'bg-[#DCE6F7] text-[#0B2256]'
                    }`}
                  >
                    {formatNumber(stats?.[item.statKey])}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari berdasarkan No. Barcode Buku, Judul Koleksi, No. Anggota, atau Nama Peminjam"
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#EEF3FA] border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors"
              />
            </div>
            <div className="relative md:w-56">
              <select
                value={jobCategory}
                onChange={(e) => changeFilter(setJobCategory)(e.target.value)}
                className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-[#EEF3FA] text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0B2256]/30 cursor-pointer"
              >
                <option value="all">Semua Kategori Anggota</option>
                {Object.entries(JOB_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="flex gap-2.5">
              <input
                type="date"
                value={date}
                onChange={(e) => changeFilter(setDate)(e.target.value)}
                title={dateField === 'due_date' ? 'Filter tanggal jatuh tempo' : 'Filter tanggal pinjam'}
                className="flex-1 md:w-40 h-10 px-3 rounded-xl bg-[#EEF3FA] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2256]/30"
              />
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset semua filter"
                className="w-10 h-10 rounded-xl bg-[#EEF3FA] hover:bg-[#DCE6F7] text-[#0B2256] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                title="Filter lanjutan"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  showAdvanced ? 'bg-[#0B2256] text-white' : 'bg-[#EEF3FA] hover:bg-[#DCE6F7] text-[#0B2256]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="font-semibold">Filter tanggal berdasarkan:</span>
              {[
                { value: 'loan_date', label: 'Tanggal Pinjam' },
                { value: 'due_date', label: 'Tanggal Jatuh Tempo' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => changeFilter(setDateField)(option.value)}
                  className={`h-7 px-3 rounded-full font-semibold transition-colors cursor-pointer ${
                    dateField === option.value ? 'bg-[#0B2256] text-white' : 'bg-[#EEF3FA] hover:bg-[#DCE6F7] text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-[#F5F8FC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleSelectPage}
                className="w-4 h-4 rounded accent-[#0B2256] cursor-pointer"
              />
              <span>Pilih Semua (Terpilih: {selectedIds.length})</span>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedIds([])
                  }}
                  className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Hapus pilihan
                </button>
              )}
            </label>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold">Urutkan:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => changeFilter(setSort)(e.target.value)}
                  className="h-8 pl-3 pr-8 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 appearance-none focus:outline-none focus:border-[#0B2256] cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F5F8FC] text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="w-12 px-4 py-2.5" />
                  <th className="px-2 py-2.5">Identitas Buku &amp; Eksemplar</th>
                  <th className="px-4 py-2.5">Peminjam &amp; Kategori</th>
                  <th className="px-4 py-2.5">Masa Peminjaman</th>
                  <th className="px-4 py-2.5">Sisa Waktu</th>
                  <th className="px-4 py-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-[#0B2256]" />
                      Memuat daftar pinjaman...
                    </td>
                  </tr>
                )}

                {!loading && loadError && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs font-semibold text-rose-600">
                      {loadError}
                    </td>
                  </tr>
                )}

                {!loading && !loadError && rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">
                      Tidak ada transaksi pinjaman aktif yang sesuai dengan filter.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !loadError &&
                  rows.map((row) => {
                    const Icon = getDdcIcon(row)
                    const waUrl = buildWhatsAppUrl(row)
                    const selected = selectedIds.includes(row.loan_id)

                    return (
                      <tr key={row.loan_id} className={`align-top ${selected ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(row.loan_id)}
                            aria-label={`Pilih ${row.title}`}
                            className="w-4 h-4 mt-1 rounded accent-[#0B2256] cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex gap-3">
                            <span className="w-10 h-10 rounded-lg bg-[#EEF3FA] text-[#0B2256] flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                                <span className="px-1.5 py-0.5 rounded bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold font-mono">
                                  {row.barcode_no}
                                </span>
                                {row.call_number && <span>DDC: {row.call_number}</span>}
                              </div>
                              <p className="text-sm font-semibold text-[#0B2256] mt-1 leading-snug">{row.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {row.author || 'Tanpa pengarang'}
                                {row.publisher ? ` • ${row.publisher}` : ''}
                                {row.publish_year ? ` (${row.publish_year})` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-[#0B2256]">{row.member.name}</p>
                          <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">{row.member.member_no}</p>
                          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#DCE6F7] text-[#0B2256] text-[11px]">
                            {JOB_LABELS[row.member.job_category] ?? row.member.job_category}
                            {row.member.institution_name ? ` ${row.member.institution_name}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-4">{renderPeriod(row)}</td>
                        <td className="px-4 py-4">{renderRemaining(row)}</td>
                        <td className="px-4 py-4 text-center">
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Kirim pengingat via WhatsApp"
                              className="inline-flex w-9 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 items-center justify-center transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          ) : (
                            <span
                              title="Nomor telepon anggota belum tersedia"
                              className="inline-flex w-9 h-9 rounded-lg bg-slate-100 text-slate-300 items-center justify-center cursor-not-allowed"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Menampilkan {meta.from} - {meta.to} dari {formatNumber(meta.total)} transaksi pinjaman aktif
                </span>
                <span className="flex items-center gap-2">
                  Tampilkan:
                  <select
                    value={perPage}
                    onChange={(e) => changeFilter(setPerPage)(Number(e.target.value))}
                    className="h-7 px-2 rounded-lg bg-[#EEF3FA] text-xs font-semibold text-[#0B2256] focus:outline-none cursor-pointer"
                  >
                    {PER_PAGE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} per halaman
                      </option>
                    ))}
                  </select>
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={meta.current_page <= 1}
                  className="h-8 px-3 rounded-lg bg-[#EEF3FA] hover:bg-[#DCE6F7] text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </button>
                {getPageNumbers(meta.current_page, meta.last_page).map((item, idx) =>
                  item === '…' ? (
                    <span key={`gap-${idx}`} className="px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`min-w-8 h-8 px-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                        item === meta.current_page ? 'bg-[#0B2256] text-white' : 'bg-[#EEF3FA] hover:bg-[#DCE6F7] text-[#0B2256]'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={meta.current_page >= meta.last_page}
                  className="h-8 px-3 rounded-lg bg-[#EEF3FA] hover:bg-[#DCE6F7] text-[#0B2256] font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
