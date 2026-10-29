import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  BellRing,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { fetchMyLoans } from '../../services/api'
import { notifyLoginRequired } from '../../utils/notification'

const formatDate = (iso, month = 'short') =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' }) : '-'

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const ACTIVE_STATES = ['on_time', 'due_today', 'overdue']

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3.5">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-[#032360] leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}

function DueStatus({ loan }) {
  if (loan.state === 'overdue') {
    return (
      <div className="rounded-xl bg-rose-50 px-4 py-3 text-rose-700">
        <p className="text-sm font-extrabold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Terlambat {loan.late_days} Hari
        </p>
        <p className="text-xs mt-0.5">Estimasi denda {formatRupiah(loan.fine)} • Segera kembalikan ke meja sirkulasi</p>
      </div>
    )
  }
  if (loan.state === 'due_today') {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-amber-800">
        <p className="text-sm font-extrabold flex items-center gap-1.5">
          <BellRing className="w-4 h-4" />
          Jatuh Tempo Hari Ini
        </p>
        <p className="text-xs mt-0.5">Kembalikan sebelum layanan tutup agar terhindar dari denda</p>
      </div>
    )
  }
  return (
    <div className={`rounded-xl px-4 py-3 ${loan.days_left <= 2 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
      <p className="text-sm font-extrabold flex items-center gap-1.5">
        <Clock className="w-4 h-4" />
        Sisa {loan.days_left} Hari
      </p>
      <p className="text-xs mt-0.5">
        {loan.extension_count > 0 ? `Sudah diperpanjang ${loan.extension_count}x` : 'Masa pinjam berjalan normal'}
      </p>
    </div>
  )
}

function BookInfo({ book }) {
  return (
    <div className="flex gap-4 min-w-0">
      <div className="w-12 h-16 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <BookOpen className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-extrabold text-[#032360] leading-snug">{book.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {book.author || 'Tanpa pengarang'}
          {book.publisher ? ` • ${book.publisher}` : ''}
          {book.publish_year ? ` (${book.publish_year})` : ''}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-mono">
          {book.barcode_no}
          {book.call_number ? ` • ${book.call_number}` : ''}
        </p>
      </div>
    </div>
  )
}

export default function PinjamanSaya() {
  const navigate = useNavigate()
  const location = useLocation()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('active')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchMyLoans()
      setData(result.data)
    } catch (err) {
      if (err.status === 401) {
        notifyLoginRequired('Sesi Anda telah berakhir. Silakan login kembali untuk melihat pinjaman.')
        navigate('/login', { state: { from: location } })
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [navigate, location])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loans = data?.loans ?? []
  const activeLoans = loans.filter((loan) => ACTIVE_STATES.includes(loan.state))
  const historyLoans = loans.filter((loan) => !ACTIVE_STATES.includes(loan.state))
  const summary = data?.summary

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032360] tracking-tight">Pinjaman Saya</h1>
            <p className="text-sm text-slate-500 mt-1">
              Cek buku yang sedang Anda pinjam, batas waktu pengembalian, dan estimasi denda keterlambatan.
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              label="Sedang Dipinjam"
              value={`${summary.active} / ${data.eligibility.quota.max} Buku`}
              icon={BookOpen}
              tone="bg-indigo-50 text-indigo-600"
            />
            <SummaryCard label="Terlambat" value={summary.overdue} icon={AlertTriangle} tone="bg-rose-50 text-rose-600" />
            <SummaryCard label="Jatuh Tempo ≤ 2 Hari" value={summary.due_soon} icon={BellRing} tone="bg-amber-50 text-amber-600" />
            <SummaryCard
              label="Estimasi Denda Berjalan"
              value={formatRupiah(summary.fine_estimate)}
              icon={Wallet}
              tone="bg-emerald-50 text-emerald-600"
            />
          </div>
        )}

        {summary?.overdue > 0 && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Anda memiliki {summary.overdue} buku yang melewati jatuh tempo. Denda bertambah setiap hari hingga buku
              dikembalikan.
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {[
            { key: 'active', label: 'Sedang Dipinjam', count: activeLoans.length },
            { key: 'history', label: 'Riwayat Pengembalian', count: historyLoans.length },
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
              <span className={`px-1.5 rounded-md text-[10px] ${tab === item.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {loading && !data && (
          <div className="py-16 text-center text-sm text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-indigo-600" />
            Memuat pinjaman...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {data && (tab === 'active' ? activeLoans : historyLoans).length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-12 px-6 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              {tab === 'active' ? 'Tidak ada buku yang sedang dipinjam' : 'Belum ada riwayat pengembalian'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {tab === 'active' &&
            activeLoans.map((loan) => (
              <article key={loan.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <BookInfo book={loan.book} />
                  <div className="md:w-72 shrink-0">
                    <DueStatus loan={loan} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    Dipinjam: <b>{formatDate(loan.loan_date)}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                    Jatuh Tempo: <b>{formatDate(loan.due_date, 'long')}</b>
                  </span>
                  <span className="font-mono text-slate-400">{loan.loan_number}</span>
                  {loan.reservation_code && <span className="text-indigo-600">Via reservasi {loan.reservation_code}</span>}
                </div>
              </article>
            ))}

          {tab === 'history' &&
            historyLoans.map((loan) => (
              <article
                key={loan.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <BookInfo book={loan.book} />
                <div className="md:text-right text-xs text-slate-600 shrink-0 space-y-1">
                  {loan.state === 'lost' ? (
                    <p className="font-bold text-rose-600">Tercatat Hilang</p>
                  ) : (
                    <p className="font-bold text-emerald-700 flex items-center md:justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Dikembalikan {formatDate(loan.return_date)}
                    </p>
                  )}
                  <p>
                    Dipinjam {formatDate(loan.loan_date)} • Tempo {formatDate(loan.due_date)}
                  </p>
                  {loan.fine > 0 && (
                    <p className="font-bold text-rose-600">
                      Terlambat {loan.late_days} hari • Denda {formatRupiah(loan.fine)}
                    </p>
                  )}
                </div>
              </article>
            ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
