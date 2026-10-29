import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  BookMarked,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hourglass,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  ScanLine,
  Search,
  X,
  XCircle,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  fetchAdminReservations,
  lookupAdminReservation,
  confirmReservationReady,
  markReservationUnavailable,
  pickupReservation,
} from '../../services/api'

const TABS = [
  { key: 'pending', label: 'Menunggu Verifikasi', statKey: 'pending', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
  { key: 'ready', label: 'Siap Diambil', statKey: 'ready', dot: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { key: 'history', label: 'Riwayat', statKey: 'history', dot: 'bg-slate-400', badge: 'bg-slate-200 text-slate-600' },
]

const STATE_META = {
  pending: { label: 'Menunggu Verifikasi', className: 'bg-amber-100 text-amber-800', icon: Hourglass },
  ready: { label: 'Siap Diambil', className: 'bg-emerald-100 text-emerald-800', icon: PackageCheck },
  picked_up: { label: 'Sudah Diambil', className: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  unavailable: { label: 'Tidak Tersedia', className: 'bg-rose-100 text-rose-700', icon: XCircle },
  expired: { label: 'Kedaluwarsa', className: 'bg-slate-200 text-slate-700', icon: Clock },
  cancelled: { label: 'Dibatalkan Anggota', className: 'bg-slate-200 text-slate-700', icon: XCircle },
}

const JOB_LABELS = { MAHASISWA: 'Mahasiswa', PELAJAR: 'Pelajar', UMUM: 'Umum' }

const DURATION_PRESETS = [3, 7, 14]
const DEFAULT_DURATION = 7

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'

const formatDate = (value, month = 'short') =>
  value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' }) : '-'

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const getPageNumbers = (current, last) => {
  if (last <= 5) return Array.from({ length: last }, (_, i) => i + 1)
  const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last))
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((page, idx) => (idx > 0 && page - sorted[idx - 1] > 1 ? ['…', page] : [page]))
}

// Sisa waktu pengambilan dalam jam (negatif = lewat batas)
const hoursUntil = (iso, now) => (iso ? Math.floor((new Date(iso).getTime() - now) / 3600000) : null)

function StatCard({ label, value, icon: Icon, iconClass, valueClass = 'text-[#0B2256]', note }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold leading-none ${valueClass}`}>{formatNumber(value)}</span>
            <span className="text-xs text-slate-600">Reservasi</span>
          </p>
        </div>
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </span>
      </div>
      <p className="text-xs text-slate-600">{note}</p>
    </div>
  )
}

function StateBadge({ state }) {
  const meta = STATE_META[state] || STATE_META.cancelled
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${meta.className}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  )
}

function ActionDialog({ dialog, busy, onClose, onConfirm }) {
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [openedAt] = useState(() => Date.now())
  const { type, item } = dialog
  const isPickup = type === 'pickup'
  const blocked = isPickup && item.member.block_reason

  const dueDate = new Date(openedAt)
  dueDate.setDate(dueDate.getDate() + (duration || 0))

  const config = {
    ready: {
      title: 'Konfirmasi Buku Ditemukan',
      description: 'Buku sudah diambil dari rak dan disiapkan di loket. Batas pengambilan anggota (H+3 hari kerja) mulai dihitung sejak konfirmasi ini.',
      confirmLabel: 'Ya, Buku Siap Diambil',
      confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
    },
    unavailable: {
      title: 'Tandai Buku Tidak Tersedia',
      description: 'Reservasi akan dibatalkan dengan status Tidak Tersedia dan kuota pinjam anggota dikembalikan.',
      confirmLabel: 'Ya, Tandai Tidak Tersedia',
      confirmClass: 'bg-rose-600 hover:bg-rose-700',
    },
    pickup: {
      title: 'Proses Pengambilan Reservasi',
      description: 'Pastikan anggota menunjukkan kartu anggota dan kode reservasi sesuai.',
      confirmLabel: 'Serahkan Buku & Catat Peminjaman',
      confirmClass: 'bg-[#0B2256] hover:bg-[#122e6e]',
    },
  }[type]

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={busy ? undefined : onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0B2256]">{config.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{config.description}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-4 space-y-4">
          <div className="rounded-xl bg-[#EEF3FA] p-3.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-[#0B2256]">{item.reservation_code}</span>
              <StateBadge state={item.state} />
            </div>
            <p className="text-sm font-semibold text-[#0B2256]">{item.book.title}</p>
            <p className="text-slate-600">
              <span className="font-mono">{item.book.barcode_no}</span>
              {item.book.call_number ? ` • ${item.book.call_number}` : ''}
            </p>
            <p className="text-slate-600">
              Pemesan: <b>{item.member.name}</b> ({item.member.member_no})
            </p>
          </div>

          {isPickup && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Durasi Peminjaman</p>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_PRESETS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDuration(days)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      duration === days ? 'bg-[#0B2256] text-white' : 'bg-[#EEF3FA] text-slate-700 hover:bg-[#DCE6F7]'
                    }`}
                  >
                    {duration === days && <Check className="w-3.5 h-3.5" />}
                    {days} Hari
                  </button>
                ))}
                <label className="h-10 rounded-xl bg-[#EEF3FA] px-2 flex items-center gap-1 text-[11px] text-slate-500">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={duration || ''}
                    onChange={(e) => {
                      const days = parseInt(e.target.value, 10)
                      setDuration(Number.isNaN(days) ? 0 : Math.min(Math.max(days, 1), 30))
                    }}
                    className="w-10 h-7 px-1.5 rounded-md bg-white border border-slate-200 text-xs font-bold text-[#0B2256] focus:outline-none"
                  />
                  Hari
                </label>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <CalendarCheck className="w-4 h-4 text-teal-700" />
                Jatuh Tempo:
                <b className="text-teal-700 text-sm">{duration >= 1 ? formatDate(dueDate, 'long') : '-'}</b>
              </p>
            </div>
          )}

          {blocked && (
            <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Tidak dapat diserahkan: {item.member.block_reason}</span>
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-10 px-4 rounded-xl bg-[#DCE6F7] hover:bg-[#CCDAF2] text-[#0B2256] text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(duration)}
            disabled={busy || Boolean(blocked) || (isPickup && duration < 1)}
            className={`h-10 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmClass}`}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminReservasi() {
  const [now, setNow] = useState(() => Date.now())

  const [rows, setRows] = useState([])
  const [stats, setStats] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [tab, setTab] = useState('pending')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [scanCode, setScanCode] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanned, setScanned] = useState(null)

  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // Perbarui hitung mundur batas pengambilan setiap menit
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

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
      const result = await fetchAdminReservations({ tab, search, page, per_page: perPage })
      setRows(result.data)
      setStats(result.stats)
      setMeta(result.meta)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [tab, search, page, perPage])

  useEffect(() => {
    loadData()
  }, [loadData])

  const changeTab = (key) => {
    setTab(key)
    setPage(1)
  }

  const handleScan = async (e) => {
    e.preventDefault()
    const code = scanCode.trim()
    if (!code) return
    setScanLoading(true)
    setScanError('')
    setScanned(null)
    try {
      const result = await lookupAdminReservation(code)
      setScanned(result.data)
      setScanCode('')
    } catch (error) {
      setScanError(error.message)
    } finally {
      setScanLoading(false)
    }
  }

  const handleConfirmDialog = async (duration) => {
    const { type, item } = dialog
    setBusy(true)
    try {
      const action = {
        ready: () => confirmReservationReady(item.id),
        unavailable: () => markReservationUnavailable(item.id),
        pickup: () => pickupReservation(item.id, duration),
      }[type]
      const result = await action()
      showToast('success', result.message)
      setStats(result.stats)
      if (scanned?.id === item.id) setScanned(result.data)
      setDialog(null)
      await loadData()
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setBusy(false)
    }
  }

  const renderActions = (item, compact = false) => {
    if (item.state === 'pending') {
      return (
        <div className={`flex gap-2 ${compact ? 'justify-end' : ''}`}>
          <button
            type="button"
            onClick={() => setDialog({ type: 'ready', item })}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Ditemukan
          </button>
          <button
            type="button"
            onClick={() => setDialog({ type: 'unavailable', item })}
            className="h-8 px-3 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Tidak Ada
          </button>
        </div>
      )
    }
    if (item.state === 'ready') {
      return (
        <div className={`flex gap-2 ${compact ? 'justify-end' : ''}`}>
          <button
            type="button"
            onClick={() => setDialog({ type: 'pickup', item })}
            className="h-8 px-3 rounded-lg bg-[#0B2256] hover:bg-[#122e6e] text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Proses Pengambilan
          </button>
          <button
            type="button"
            onClick={() => setDialog({ type: 'unavailable', item })}
            title="Batalkan: buku tidak tersedia"
            className="h-8 w-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
    return <span className="text-[11px] text-slate-400">{item.handled_by ? `Petugas: ${item.handled_by}` : '-'}</span>
  }

  const renderTiming = (item) => {
    if (item.state === 'pending') {
      const waitingHours = Math.max(0, -hoursUntil(item.reserved_at, now))
      return (
        <>
          <p className="text-xs font-bold text-amber-600">Menunggu {waitingHours < 24 ? `${waitingHours} jam` : `${Math.floor(waitingHours / 24)} hari`}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Perlu dicek di rak</p>
        </>
      )
    }
    if (item.state === 'ready') {
      const left = hoursUntil(item.pickup_deadline, now)
      const urgent = left !== null && left <= 24
      return (
        <>
          <p className={`text-xs font-bold ${urgent ? 'text-rose-600' : 'text-emerald-700'}`}>
            {left === null ? '-' : left < 24 ? `Sisa ${Math.max(left, 0)} jam` : `Sisa ${Math.floor(left / 24)} hari`}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Batas: {formatDateTime(item.pickup_deadline)}</p>
        </>
      )
    }
    if (item.state === 'picked_up') {
      return (
        <>
          <p className="text-xs font-semibold text-blue-700">Diambil {formatDate(item.borrow_date)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Jatuh tempo {formatDate(item.due_date)}</p>
        </>
      )
    }
    return <p className="text-[11px] text-slate-500">Diperbarui {formatDateTime(item.updated_at)}</p>
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-18 right-6 z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
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

      {dialog && (
        <ActionDialog
          key={`${dialog.type}-${dialog.item.id}`}
          dialog={dialog}
          busy={busy}
          onClose={() => setDialog(null)}
          onConfirm={handleConfirmDialog}
        />
      )}

      <div className="p-2 sm:p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2256] tracking-tight">Reservasi Buku</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Verifikasi ketersediaan buku di rak atas reservasi online anggota, lalu proses pengambilannya di loket
              sirkulasi menggunakan kode reservasi.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="self-start h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            Segarkan Data
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Menunggu Verifikasi"
            value={stats?.pending}
            icon={Hourglass}
            iconClass="bg-amber-100 text-amber-700"
            valueClass="text-amber-500"
            note={`+${formatNumber(stats?.new_today)} reservasi baru hari ini`}
          />
          <StatCard
            label="Siap Diambil"
            value={stats?.ready}
            icon={PackageCheck}
            iconClass="bg-emerald-100 text-emerald-700"
            valueClass="text-emerald-700"
            note={`${formatNumber(stats?.ready_due_today)} batas pengambilan hari ini`}
          />
          <StatCard
            label="Diambil Hari Ini"
            value={stats?.picked_up_today}
            icon={CheckCircle2}
            iconClass="bg-[#DCE6F7] text-[#0B2256]"
            note="Reservasi yang menjadi peminjaman"
          />
          <StatCard
            label="Gagal Bulan Ini"
            value={stats?.failed_month}
            icon={XCircle}
            iconClass="bg-rose-100 text-rose-600"
            valueClass="text-rose-700"
            note="Kedaluwarsa, tidak tersedia, atau dibatalkan"
          />
        </div>

        {/* Scan Kode Reservasi */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-9 h-9 rounded-full bg-[#0B2256] text-white flex items-center justify-center shrink-0">
              <ScanLine className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0B2256] leading-tight">Pengambilan di Loket</h2>
              <p className="text-xs text-slate-500 mt-0.5">Scan atau ketik kode reservasi yang ditunjukkan anggota</p>
            </div>
          </div>
          <form onSubmit={handleScan} className="flex gap-2.5">
            <div className="relative flex-1">
              <BookMarked className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder="Contoh: RSV-20261029-0001"
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#EEF3FA] border border-transparent text-sm font-mono text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={scanLoading || !scanCode.trim()}
              className="h-11 px-5 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Cari Reservasi</span>
            </button>
          </form>

          {scanError && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {scanError}
            </div>
          )}

          {scanned && (
            <div className="mt-4 rounded-xl bg-[#EEF3FA] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex gap-3.5 min-w-0">
                <span className="w-11 h-11 rounded-lg bg-[#D5E0F2] text-[#0B2256] flex items-center justify-center shrink-0">
                  <BookMarked className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#0B2256]">{scanned.reservation_code}</span>
                    <StateBadge state={scanned.state} />
                  </div>
                  <p className="text-sm font-semibold text-[#0B2256] mt-1">{scanned.book.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {scanned.member.name} ({scanned.member.member_no}) •{' '}
                    {scanned.state === 'ready'
                      ? `Batas ambil ${formatDateTime(scanned.pickup_deadline)}`
                      : `Direservasi ${formatDateTime(scanned.reserved_at)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {renderActions(scanned, true)}
                <button
                  type="button"
                  onClick={() => setScanned(null)}
                  className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => {
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => changeTab(item.key)}
                  className={`h-8 px-3.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    active ? 'bg-[#0B2256] text-white' : 'bg-[#EEF3FA] text-slate-700 hover:bg-[#DCE6F7]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <span>{item.label}</span>
                  <span className={`px-1.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20 text-white' : item.badge}`}>
                    {formatNumber(stats?.[item.statKey])}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="relative lg:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari kode reservasi, judul, barcode, atau anggota"
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#EEF3FA] border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors"
            />
          </div>
        </section>

        {/* Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F5F8FC] text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-4 py-3">Kode &amp; Waktu Reservasi</th>
                  <th className="px-4 py-3">Buku &amp; Lokasi Rak</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">{tab === 'ready' ? 'Batas Pengambilan' : tab === 'pending' ? 'Lama Menunggu' : 'Keterangan'}</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-[#0B2256]" />
                      Memuat reservasi...
                    </td>
                  </tr>
                )}

                {!loading && loadError && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs font-semibold text-rose-600">
                      {loadError}
                    </td>
                  </tr>
                )}

                {!loading && !loadError && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-500">
                      {tab === 'pending'
                        ? 'Tidak ada reservasi yang menunggu verifikasi rak.'
                        : tab === 'ready'
                          ? 'Tidak ada buku yang menunggu diambil anggota.'
                          : 'Belum ada riwayat reservasi yang sesuai.'}
                    </td>
                  </tr>
                )}

                {!loading &&
                  !loadError &&
                  rows.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50/60">
                      <td className="px-4 py-4">
                        <p className="font-mono text-xs font-bold text-[#0B2256]">{item.reservation_code}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{formatDateTime(item.reserved_at)}</p>
                        {tab === 'history' && (
                          <div className="mt-1.5">
                            <StateBadge state={item.state} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[#0B2256] leading-snug">{item.book.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.book.author || 'Tanpa pengarang'}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <span className="px-1.5 py-0.5 rounded bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold font-mono">
                            {item.book.barcode_no}
                          </span>
                          {item.book.call_number && <span>No. Panggil: {item.book.call_number}</span>}
                          {item.book.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.book.location}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[#0B2256]">{item.member.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">{item.member.member_no}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#DCE6F7] text-[#0B2256] text-[11px]">
                          {JOB_LABELS[item.member.job_category] ?? item.member.job_category}
                          {item.member.institution_name ? ` ${item.member.institution_name}` : ''}
                        </span>
                        {item.member.block_reason && ['pending', 'ready'].includes(item.state) && (
                          <p className="mt-1.5 flex items-start gap-1 text-[10px] font-semibold text-rose-600">
                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                            {item.member.block_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">{renderTiming(item)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">{renderActions(item)}</div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Menampilkan {meta.from} - {meta.to} dari {formatNumber(meta.total)} reservasi
                </span>
                <span className="flex items-center gap-2">
                  Tampilkan:
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value))
                      setPage(1)
                    }}
                    className="h-7 px-2 rounded-lg bg-[#EEF3FA] text-xs font-semibold text-[#0B2256] focus:outline-none cursor-pointer"
                  >
                    {[10, 25, 50].map((size) => (
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
                  className="h-8 px-3 rounded-lg bg-[#EEF3FA] hover:bg-[#DCE6F7] text-slate-700 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`min-w-8 h-8 px-2 rounded-lg font-semibold cursor-pointer transition-colors ${
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
                  className="h-8 px-3 rounded-lg bg-[#EEF3FA] hover:bg-[#DCE6F7] text-[#0B2256] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
          <CalendarClock className="w-3.5 h-3.5" />
          Reservasi "Siap Diambil" yang melewati batas H+3 hari kerja otomatis dibatalkan dan stok buku dikembalikan.
        </p>
      </div>
    </AdminLayout>
  )
}
