import { useState, useEffect, useRef, useCallback } from 'react'
import {
  AlarmClock,
  AlertTriangle,
  CheckCircle2,
  CircleCheck,
  Clock,
  IdCard,
  KeyRound,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
  ScanBarcode,
  Search,
  X,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import {
  fetchLockerDeskMember,
  fetchLockerDeskLockers,
  fetchLockerDeskLocker,
  createLockerLoan,
} from '../../services/api'

const TIMEZONE = 'Asia/Makassar'

const DEPOSIT_OPTIONS = ['KTP', 'Kartu Anggota (KTA)', 'Kartu Pelajar / KTM', 'SIM', 'Lainnya']

const JOB_LABELS = { MAHASISWA: 'Mahasiswa', PELAJAR: 'Pelajar', UMUM: 'Umum' }

const formatTime = (value) =>
  new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE }).replace('.', ':')

const formatDay = (value) =>
  new Date(value).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter((part) => /^[A-Za-z]/.test(part) && part.length > 1)
    .slice(-2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

const lockerLabel = (locker) => (locker.number !== null ? `Loker No. ${locker.number}` : `Loker ${locker.locker_code}`)

function StepHeader({ number, title, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-[#0B2256] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <h2 className="text-base sm:text-lg font-semibold text-[#0B2256] leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function ErrorBox({ message }) {
  return (
    <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default function AdminPeminjamanLoker() {
  const { user } = useAuth()
  const operatorName = user?.name || 'Petugas'

  const [now, setNow] = useState(() => Date.now())

  const [memberCode, setMemberCode] = useState('')
  const [member, setMember] = useState(null)
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberError, setMemberError] = useState('')

  const [lockerCode, setLockerCode] = useState('')
  const [locker, setLocker] = useState(null)
  const [lockerLoading, setLockerLoading] = useState(false)
  const [lockerError, setLockerError] = useState('')
  const [lockerList, setLockerList] = useState([])
  const [lockerSummary, setLockerSummary] = useState(null)
  const [service, setService] = useState(null)

  const [depositType, setDepositType] = useState(DEPOSIT_OPTIONS[0])
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(null)
  const [toast, setToast] = useState(null)

  const memberInputRef = useRef(null)
  const lockerInputRef = useRef(null)

  const canPickLocker = Boolean(member?.eligible) && !completed
  const canSubmit = canPickLocker && Boolean(locker) && !submitting

  // Jam penyerahan kunci mengikuti waktu berjalan
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(timer)
  }, [])

  const loadLockers = useCallback(async () => {
    try {
      const result = await fetchLockerDeskLockers()
      setLockerList(result.data.lockers)
      setLockerSummary(result.data.summary)
      setService(result.data.service)
    } catch (error) {
      setLockerError(error.message)
    }
  }, [])

  useEffect(() => {
    loadLockers()
  }, [loadLockers])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const focusLater = (ref) => setTimeout(() => ref.current?.focus(), 50)

  const clearLocker = () => {
    setLocker(null)
    setLockerCode('')
    setLockerError('')
  }

  const handleSearchMember = async (e) => {
    e?.preventDefault()
    const code = memberCode.trim()
    if (!code) return

    setMemberLoading(true)
    setMemberError('')
    setMember(null)
    setCompleted(null)
    clearLocker()

    try {
      const result = await fetchLockerDeskMember(code)
      setMember(result.data)
      if (result.data.eligible) focusLater(lockerInputRef)
    } catch (error) {
      setMemberError(error.message)
    } finally {
      setMemberLoading(false)
    }
  }

  const handleReset = () => {
    setMember(null)
    setMemberCode('')
    setMemberError('')
    setCompleted(null)
    setDepositType(DEPOSIT_OPTIONS[0])
    clearLocker()
    focusLater(memberInputRef)
  }

  const selectLocker = async (code) => {
    if (!code || !canPickLocker) return
    setLockerLoading(true)
    setLockerError('')

    try {
      const result = await fetchLockerDeskLocker(code)
      setLocker(result.data)
      setLockerCode('')
    } catch (error) {
      setLockerError(error.message)
      focusLater(lockerInputRef)
    } finally {
      setLockerLoading(false)
    }
  }

  const handleScanLocker = (e) => {
    e?.preventDefault()
    selectLocker(lockerCode.trim())
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    try {
      const result = await createLockerLoan({
        member_no: member.member_no,
        locker_code: locker.locker_code,
        deposit_type: depositType,
      })
      setCompleted(result.data)
      setMember(result.data.member)
      setService(result.data.service)
      showToast('success', result.message)
      loadLockers()
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handoverTime = completed?.borrow_date ?? now
  const deadline = service?.return_deadline

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold max-w-sm ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="p-2 sm:p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2256] tracking-tight">Peminjaman Loker Penitipan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pindai kartu anggota dan scan barcode kunci loker untuk pencatatan penitipan barang pengunjung di ruang baca.
          </p>
        </div>

        {/* Step 1: Identifikasi Anggota */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <StepHeader
            number={1}
            title="Identifikasi Pengunjung / Anggota"
            action={
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti Anggota</span>
              </button>
            }
          />

          <form onSubmit={handleSearchMember} className="flex gap-2.5">
            <div className="relative flex-1">
              <IdCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={memberInputRef}
                autoFocus
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="Scan kartu atau ketik nomor anggota / NIK / email"
                className="w-full h-11 pl-11 pr-11 rounded-xl bg-[#EEF3FA] border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={memberLoading || !memberCode.trim()}
              className="h-11 px-5 sm:px-8 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {memberLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Cari Anggota</span>
            </button>
          </form>

          {memberError && <ErrorBox message={memberError} />}

          {member && (
            <div className="mt-4 rounded-xl bg-[#EEF3FA] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="relative w-12 h-12 rounded-xl bg-[#0B2256] text-white font-bold flex items-center justify-center shrink-0">
                  {getInitials(member.name)}
                  <CircleCheck className="w-4 h-4 absolute -bottom-1 -right-1 text-white bg-emerald-600 rounded-full" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-[#0B2256]">{member.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold">
                      {member.status?.toLowerCase().startsWith('aktif') ? 'Aktif' : member.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {JOB_LABELS[member.job_category] ?? member.job_category}
                    {member.institution_name ? ` (${member.institution_name})` : ''}
                    <span className="mx-1.5">•</span>
                    <span className="font-mono">ID: {member.member_no}</span>
                  </p>
                </div>
              </div>
              <div className="self-start md:self-auto grid grid-cols-2 gap-4 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[11px] shrink-0">
                <div>
                  <p className="text-slate-500">Status Loker Saat Ini</p>
                  {member.active_locker ? (
                    <p className="mt-0.5 flex items-center gap-1 font-semibold text-rose-600">
                      <KeyRound className="w-3.5 h-3.5" />
                      Memegang {member.active_locker.locker_code}
                    </p>
                  ) : (
                    <p className="mt-0.5 flex items-center gap-1 font-semibold text-emerald-700">
                      <CircleCheck className="w-3.5 h-3.5" />
                      Bebas Kunci (0 Dipinjam)
                    </p>
                  )}
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <p className="text-slate-500">Maksimal Kuota</p>
                  <p className="mt-0.5 font-semibold text-slate-800">1 Loker / Kunjungan</p>
                </div>
              </div>
            </div>
          )}

          {member && !member.eligible && !completed && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{member.block_reason}</span>
            </div>
          )}
        </section>

        {/* Step 2: Scan Kunci Loker */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <StepHeader
            number={2}
            title="Scan Barcode Kunci Loker"
            action={
              lockerSummary && (
                <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                  {lockerSummary.available} dari {lockerSummary.total} loker tersedia
                </span>
              )
            }
          />

          {!locker && (
            <form onSubmit={handleScanLocker} className="flex gap-2.5">
              <div className="relative flex-1">
                <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={lockerInputRef}
                  value={lockerCode}
                  onChange={(e) => setLockerCode(e.target.value)}
                  disabled={!canPickLocker}
                  placeholder={canPickLocker ? 'Scan barcode kunci loker (mis. LCK-01)...' : 'Identifikasi anggota terlebih dahulu...'}
                  className="w-full h-11 pl-11 pr-11 rounded-xl bg-[#EEF3FA] border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <button
                type="submit"
                disabled={!canPickLocker || lockerLoading || !lockerCode.trim()}
                className="h-11 px-5 sm:px-8 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {lockerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">Scan / Cari</span>
              </button>
            </form>
          )}

          {lockerError && <ErrorBox message={lockerError} />}

          {locker ? (
            <div className="rounded-xl bg-[#EEF3FA] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="w-14 h-14 rounded-xl bg-[#0B2256] text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                  <span className="text-[8px] tracking-wider text-blue-200 uppercase">Loker</span>
                  <span className="text-2xl font-extrabold leading-none">{locker.number ?? '#'}</span>
                </span>
                <div>
                  <p className="text-base font-semibold text-[#0B2256]">{lockerLabel(locker)}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{locker.locker_code}</p>
                </div>
              </div>
              {!completed && (
                <button
                  type="button"
                  onClick={() => {
                    clearLocker()
                    focusLater(lockerInputRef)
                  }}
                  className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Batal Pilih
                </button>
              )}
            </div>
          ) : (
            canPickLocker &&
            lockerList.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] text-slate-500 mb-2">Atau pilih langsung loker yang tersedia:</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {lockerList.map((item) => {
                    const available = item.status === 'AVAILABLE'
                    return (
                      <button
                        key={item.locker_code}
                        type="button"
                        disabled={!available || lockerLoading}
                        onClick={() => selectLocker(item.locker_code)}
                        title={available ? `Pilih ${item.locker_code}` : `${item.locker_code}: ${item.status}`}
                        className={`h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-colors ${available
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                          : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          }`}
                      >
                        <span className="text-base leading-none">{item.number ?? '#'}</span>
                        <span className="text-[9px] font-medium mt-1 no-underline">{available ? 'Tersedia' : 'Terpakai'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </section>

        {/* Step 3: Konfirmasi */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <StepHeader number={3} title="Konfirmasi Peminjaman" />

          <div className="rounded-xl bg-[#EEF3FA] p-4 sm:p-5">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Rincian Waktu Sirkulasi</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-600">Waktu Penyerahan Kunci</p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-[#0B2256]">
                  <Clock className="w-4 h-4 text-teal-600" />
                  {formatTime(handoverTime)} WITA
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{formatDay(handoverTime)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-600">Batas Pengembalian Kunci</p>
                <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-rose-600">
                  <AlarmClock className="w-4 h-4" />
                  {deadline ? `${formatTime(deadline)} WITA` : '-'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {service?.is_after_hours ? 'Layanan sudah melewati jam tutup' : 'Sebelum Layanan Tutup'}
                </p>
              </div>
            </div>
          </div>

          {completed && (
            <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <span className="font-bold">
                  Kunci {completed.locker.locker_code} telah diserahkan kepada {completed.member.name}.
                </span>{' '}
                No. Transaksi <span className="font-mono font-bold">{completed.loan_number}</span> • Jaminan:{' '}
                {completed.deposit_type}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="h-12 px-6 rounded-xl bg-[#DCE6F7] hover:bg-[#CCDAF2] text-[#0B2256] text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{completed ? 'Transaksi Baru' : 'Batal / Reset'}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="h-12 px-6 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>{submitting ? 'Memproses...' : 'Konfirmasi & Serahkan Kunci Loker'}</span>
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
