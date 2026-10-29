import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  BookMarked,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  Hourglass,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { fetchMyReservations, cancelReservation } from '../../services/api'
import { notification, notifyLoginRequired } from '../../utils/notification'
import CancelReservationDialog from './CancelReservationDialog'

const STATE_META = {
  pending: {
    label: 'Menunggu Verifikasi Petugas',
    badge: 'bg-amber-100 text-amber-800',
    icon: Hourglass,
    hint: 'Petugas sedang mencari buku di rak. Status akan berubah menjadi "Siap Diambil" setelah buku ditemukan.',
  },
  ready: {
    label: 'Siap Diambil',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: PackageCheck,
    hint: 'Buku sudah disiapkan. Tunjukkan kode reservasi dan kartu anggota di meja sirkulasi.',
  },
  picked_up: { label: 'Sudah Diambil', badge: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  unavailable: {
    label: 'Buku Tidak Tersedia',
    badge: 'bg-rose-100 text-rose-700',
    icon: XCircle,
    hint: 'Buku tidak ditemukan di rak. Kuota Anda sudah dikembalikan.',
  },
  expired: {
    label: 'Kedaluwarsa',
    badge: 'bg-slate-200 text-slate-700',
    icon: Clock,
    hint: 'Buku tidak diambil sampai batas waktu, reservasi dibatalkan otomatis.',
  },
  cancelled: { label: 'Dibatalkan', badge: 'bg-slate-200 text-slate-700', icon: XCircle },
}

const ACTIVE_STATES = ['pending', 'ready']

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

function ReservationCard({ item, onCancel, cancelling }) {
  const meta = STATE_META[item.state] || STATE_META.cancelled
  const StateIcon = meta.icon
  const isActive = ACTIVE_STATES.includes(item.state)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(item.reservation_code)
      notification.success({ message: 'Kode reservasi disalin', placement: 'topRight', duration: 2 })
    } catch {
      // Clipboard tidak tersedia; kode tetap terlihat di layar
    }
  }

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm p-5 sm:p-6 ${
        item.state === 'ready' ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200/80'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          <div className="w-12 h-16 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookMarked className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${meta.badge}`}>
              <StateIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
            <h3 className="text-base font-extrabold text-[#032360] mt-2 leading-snug">{item.book.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.book.author || 'Tanpa pengarang'}
              {item.book.publisher ? ` • ${item.book.publisher}` : ''}
              {item.book.publish_year ? ` (${item.book.publish_year})` : ''}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500">
              {item.book.call_number && <span>No. Panggil: {item.book.call_number}</span>}
              {item.book.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.book.location}
                </span>
              )}
              <span>Direservasi: {formatDate(item.reserved_at)}</span>
            </div>
          </div>
        </div>

        <div className="md:text-right shrink-0">
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Kode Reservasi</p>
          <button
            type="button"
            onClick={copyCode}
            title="Salin kode"
            className={`mt-1 inline-flex items-center gap-2 font-mono font-extrabold text-lg cursor-pointer ${
              isActive ? 'text-[#032360]' : 'text-slate-400'
            }`}
          >
            {item.reservation_code}
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {(meta.hint || item.state === 'ready') && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-xs flex items-start gap-2.5 ${
            item.state === 'ready' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
          }`}
        >
          {item.state === 'ready' ? (
            <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />
          )}
          <div>
            {item.state === 'ready' && (
              <p className="font-bold">Ambil sebelum {formatDateTime(item.pickup_deadline)}</p>
            )}
            {meta.hint && <p className={item.state === 'ready' ? 'mt-0.5' : ''}>{meta.hint}</p>}
          </div>
        </div>
      )}

      {item.can_cancel && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onCancel(item)}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Batalkan Reservasi
          </button>
        </div>
      )}
    </article>
  )
}

export default function ReservasiSaya() {
  const navigate = useNavigate()
  const location = useLocation()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('active')
  const [cancellingId, setCancellingId] = useState(null)
  // Overlay pembatalan: null | { mode: 'confirm' | 'success', item }
  const [cancelDialog, setCancelDialog] = useState(null)

  const handleUnauthorized = useCallback(() => {
    notifyLoginRequired('Sesi Anda telah berakhir. Silakan login kembali untuk melihat reservasi.')
    navigate('/login', { state: { from: location } })
  }, [navigate, location])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchMyReservations()
      setData(result.data)
    } catch (err) {
      if (err.status === 401) {
        handleUnauthorized()
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCancel = (item) => {
    setCancelDialog({ mode: 'confirm', item })
  }

  const confirmCancel = async () => {
    const { item } = cancelDialog
    setCancellingId(item.id)
    try {
      await cancelReservation(item.id)
      setCancelDialog({ mode: 'success', item })
      await loadData()
    } catch (err) {
      setCancelDialog(null)
      if (err.status === 401) {
        handleUnauthorized()
        return
      }
      notification.error({ message: 'Gagal Membatalkan', description: err.message, placement: 'topRight' })
    } finally {
      setCancellingId(null)
    }
  }

  const reservations = data?.reservations ?? []
  const activeItems = reservations.filter((item) => ACTIVE_STATES.includes(item.state))
  const historyItems = reservations.filter((item) => !ACTIVE_STATES.includes(item.state))
  const shownItems = tab === 'active' ? activeItems : historyItems
  const quota = data?.eligibility?.quota

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032360] tracking-tight">Reservasi Saya</h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau status reservasi buku Anda dan tunjukkan kode reservasi di meja sirkulasi saat buku siap diambil.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Segarkan
            </button>
            <button
              type="button"
              onClick={() => navigate('/opac')}
              className="px-4 py-2 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Cari Buku di OPAC
            </button>
          </div>
        </div>

        {/* Kuota */}
        {quota && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Kuota Pinjam &amp; Reservasi</p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="text-3xl font-extrabold text-[#032360]">{quota.used}</span> / {quota.max} buku terpakai
                <span className="text-xs text-slate-400"> (reservasi aktif + buku yang sedang dipinjam)</span>
              </p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: quota.max }, (_, idx) => (
                <span
                  key={idx}
                  className={`w-10 h-2.5 rounded-full ${idx < quota.used ? 'bg-[#002B66]' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>
        )}

        {data?.eligibility && !data.eligibility.eligible && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Anda belum dapat membuat reservasi baru: {data.eligibility.block_reason}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'active', label: 'Reservasi Aktif', count: activeItems.length },
            { key: 'history', label: 'Riwayat', count: historyItems.length },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                tab === item.key ? 'bg-[#002B66] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
              <span
                className={`px-1.5 rounded-md text-[10px] ${tab === item.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {loading && !data && (
          <div className="py-16 text-center text-sm text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-indigo-600" />
            Memuat reservasi...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {data && shownItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-12 px-6 text-center">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              {tab === 'active' ? 'Belum ada reservasi aktif' : 'Belum ada riwayat reservasi'}
            </p>
            {tab === 'active' && (
              <p className="text-xs text-slate-500 mt-1">
                Temukan buku di OPAC lalu klik "Reservasi Buku Ini" pada halaman detail buku.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {shownItems.map((item) => (
            <ReservationCard key={item.id} item={item} onCancel={handleCancel} cancelling={cancellingId === item.id} />
          ))}
        </div>
      </main>

      <Footer />

      {/* Overlay Konfirmasi & Hasil Pembatalan Reservasi */}
      {cancelDialog && (
        <CancelReservationDialog
          mode={cancelDialog.mode}
          item={cancelDialog.item}
          submitting={cancellingId !== null}
          onClose={() => setCancelDialog(null)}
          onConfirm={confirmCancel}
          onFindBooks={() => navigate('/opac')}
        />
      )}
    </div>
  )
}
