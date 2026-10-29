import { useState, useRef } from 'react'
import {
  ArrowLeftRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  AlertTriangle,
  IdCard,
  Loader2,
  Plus,
  Printer,
  RotateCcw,
  ScanBarcode,
  Search,
  X,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  fetchBorrowMember,
  fetchBorrowCollection,
  searchBorrowCollections,
  createBorrowTransaction,
} from '../../services/api'

const DURATION_PRESETS = [
  { days: 3, label: '3 Hari' },
  { days: 7, label: '7 Hari (Standar)' },
  { days: 14, label: '14 Hari' },
]
const DEFAULT_DURATION = 7
const MAX_DURATION = 30

const JOB_LABELS = { MAHASISWA: 'Mahasiswa', PELAJAR: 'Pelajar', UMUM: 'Umum' }

const formatDate = (date, month = 'short') =>
  date.toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' })

const formatLongDay = (date) =>
  date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter((part) => /^[A-Za-z]/.test(part) && part.length > 1)
    .slice(-2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

function StepHeader({ number, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="flex items-start gap-3.5">
        <span className="w-9 h-9 rounded-full bg-[#0B2256] text-white text-sm font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#0B2256] leading-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

function printReceipt(receipt) {
  const rows = receipt.loans
    .map(
      (loan, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${escapeHtml(loan.collection?.catalog?.title ?? '-')}</b><br/><small>${escapeHtml(loan.collection?.barcode_no ?? '')}</small></td>
          <td>${escapeHtml(loan.due_date ?? '-')}</td>
        </tr>`
    )
    .join('')

  const win = window.open('', '_blank', 'width=420,height=640')
  if (!win) return
  win.document.write(`<!doctype html><html><head><title>Struk Peminjaman</title>
    <style>
      body{font-family:monospace;font-size:12px;padding:16px;color:#000}
      h1{font-size:14px;text-align:center;margin:0}
      p{margin:2px 0}.c{text-align:center}hr{border:0;border-top:1px dashed #000;margin:8px 0}
      table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:3px 2px}
    </style></head><body>
    <h1>ATLAS | DAPD Kab. Buleleng</h1>
    <p class="c">Struk Peminjaman Buku</p><hr/>
    <p>Tanggal : ${formatDate(receipt.date, 'long')}</p>
    <p>Anggota : ${escapeHtml(receipt.member.name)}</p>
    <p>No. Agt : ${escapeHtml(receipt.member.member_no)}</p>
    <p>No. Pinj: ${escapeHtml(receipt.loans.map((l) => l.loan_number).join(', '))}</p><hr/>
    <table>${rows}</table><hr/>
    <p>Jatuh Tempo: <b>${formatDate(receipt.dueDate, 'long')}</b></p>
    <p>Petugas : ${escapeHtml(receipt.loans[0]?.created_by ?? '-')}</p><hr/>
    <p class="c">Harap kembalikan buku tepat waktu.<br/>Terima kasih.</p>
    </body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

export default function AdminPeminjaman() {
  const [today] = useState(() => new Date())

  const [memberCode, setMemberCode] = useState('')
  const [member, setMember] = useState(null)
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberError, setMemberError] = useState('')

  const [barcode, setBarcode] = useState('')
  const [books, setBooks] = useState([])
  const [bookLoading, setBookLoading] = useState(false)
  const [bookError, setBookError] = useState('')

  // Saran pencarian judul untuk buku yang belum ditempel label barcode
  const [suggestions, setSuggestions] = useState([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestMessage, setSuggestMessage] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchTimerRef = useRef(null)
  const searchSeqRef = useRef(0)

  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [toast, setToast] = useState(null)

  const memberInputRef = useRef(null)
  const bookInputRef = useRef(null)

  const dueDate = addDays(today, duration)
  const remainingQuota = member ? member.quota.remaining - books.length : 0
  const canScan = Boolean(member?.eligible) && remainingQuota > 0
  const canSubmit = Boolean(member?.eligible) && books.length > 0 && duration >= 1 && !submitting

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const closeSuggestions = () => {
    clearTimeout(searchTimerRef.current)
    searchSeqRef.current += 1
    setSuggestions([])
    setSuggestOpen(false)
    setSuggestLoading(false)
    setSuggestMessage('')
    setActiveIndex(-1)
  }

  const resetBooks = () => {
    setBooks([])
    setBarcode('')
    setBookError('')
    closeSuggestions()
  }

  const handleSearchMember = async (e) => {
    e?.preventDefault()
    const code = memberCode.trim()
    if (!code) return

    setMemberLoading(true)
    setMemberError('')
    setMember(null)
    setReceipt(null)
    resetBooks()

    try {
      const result = await fetchBorrowMember(code)
      setMember(result.data)
      if (result.data.eligible) {
        setTimeout(() => bookInputRef.current?.focus(), 50)
      }
    } catch (error) {
      setMemberError(error.message)
    } finally {
      setMemberLoading(false)
    }
  }

  const handleChangeMember = () => {
    setMember(null)
    setMemberCode('')
    setMemberError('')
    setReceipt(null)
    resetBooks()
    setTimeout(() => memberInputRef.current?.focus(), 50)
  }

  const runTitleSearch = async (keyword) => {
    const seq = ++searchSeqRef.current
    setSuggestLoading(true)
    setSuggestOpen(true)

    try {
      const result = await searchBorrowCollections(keyword)
      if (seq !== searchSeqRef.current) return
      const chosen = new Set(books.map((book) => book.barcode_no))
      const items = result.data.filter((item) => !chosen.has(item.barcode_no))
      setSuggestions(items)
      setSuggestMessage(items.length ? '' : `Tidak ada eksemplar tersedia yang cocok dengan "${keyword}".`)
      setActiveIndex(items.length ? 0 : -1)
    } catch (error) {
      if (seq !== searchSeqRef.current) return
      setSuggestions([])
      setSuggestMessage(error.message)
    } finally {
      if (seq === searchSeqRef.current) setSuggestLoading(false)
    }
  }

  const handleBookInputChange = (value) => {
    setBarcode(value)
    setBookError('')
    clearTimeout(searchTimerRef.current)

    const keyword = value.trim()
    if (keyword.length < 2) {
      closeSuggestions()
      return
    }
    searchTimerRef.current = setTimeout(() => runTitleSearch(keyword), 350)
  }

  const addBookByBarcode = async (code) => {
    if (books.some((book) => book.barcode_no.toLowerCase() === code.toLowerCase())) {
      setBookError(`Buku dengan barcode '${code}' sudah ada di daftar.`)
      return false
    }

    setBookLoading(true)
    setBookError('')

    try {
      const result = await fetchBorrowCollection(code)
      setBooks((prev) => [...prev, result.data])
      setBarcode('')
      closeSuggestions()
      return true
    } catch (error) {
      if (error.status !== 404) setBookError(error.message)
      return error.status === 404 ? null : false
    } finally {
      setBookLoading(false)
      setTimeout(() => bookInputRef.current?.focus(), 50)
    }
  }

  const handleAddBook = async (e) => {
    e?.preventDefault()
    const code = barcode.trim()
    if (!code || !canScan) return

    const activeSuggestion = suggestOpen && activeIndex >= 0 ? suggestions[activeIndex] : null

    // Prioritas barcode persis (scanner); jika tidak dikenal, pakai saran judul yang dipilih
    const added = await addBookByBarcode(code)
    if (added !== null) return

    if (activeSuggestion) {
      await addBookByBarcode(activeSuggestion.barcode_no)
    } else {
      clearTimeout(searchTimerRef.current)
      await runTitleSearch(code)
    }
  }

  const handleBookKeyDown = (e) => {
    if (!suggestOpen || suggestions.length === 0) {
      if (e.key === 'Escape') closeSuggestions()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((idx) => (idx + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((idx) => (idx <= 0 ? suggestions.length - 1 : idx - 1))
    } else if (e.key === 'Escape') {
      closeSuggestions()
    }
  }

  const handleRemoveBook = (barcodeNo) => {
    setBooks((prev) => prev.filter((book) => book.barcode_no !== barcodeNo))
    setBookError('')
  }

  const handleCustomDuration = (value) => {
    const days = parseInt(value, 10)
    if (Number.isNaN(days)) {
      setDuration(0)
      return
    }
    setDuration(Math.min(Math.max(days, 1), MAX_DURATION))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    try {
      const result = await createBorrowTransaction({
        member_no: member.member_no,
        barcodes: books.map((book) => book.barcode_no),
        duration_days: duration,
      })
      setReceipt({
        member,
        loans: result.data.loans,
        date: today,
        dueDate,
      })
      setMember(result.data.member)
      resetBooks()
      showToast('success', result.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    handleChangeMember()
    setDuration(DEFAULT_DURATION)
  }

  const isPreset = DURATION_PRESETS.some((preset) => preset.days === duration)

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold max-w-sm ${
              toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
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

      <div className="p-2 sm:p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2256] tracking-tight">
              Peminjaman Buku
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pindai barcode anggota dan buku untuk menyelesaikan transaksi peminjaman.
            </p>
          </div>
          <div className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shrink-0">
            <CalendarDays className="w-4 h-4 text-[#0B2256]" />
            <span className="capitalize">{formatLongDay(today)}</span>
          </div>
        </div>

        {/* Step 1: Identifikasi Anggota */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <StepHeader
            number={1}
            title="Identifikasi Anggota"
            subtitle="Pindai kartu atau masukkan nomor identitas anggota"
            action={
              <button
                type="button"
                onClick={handleChangeMember}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0B2256] hover:text-blue-700 cursor-pointer shrink-0"
              >
                <ArrowLeftRight className="w-4 h-4" />
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
                placeholder="Masukkan / scan nomor anggota, NIK, atau email"
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#EEF3FA] border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={memberLoading || !memberCode.trim()}
              className="h-11 px-5 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {memberLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Cari</span>
            </button>
          </form>

          {memberError && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{memberError}</span>
            </div>
          )}

          {member && (
            <div className="mt-4 rounded-xl bg-[#EEF3FA] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-11 h-11 rounded-lg bg-[#D5E0F2] text-[#0B2256] font-bold flex items-center justify-center shrink-0">
                  {getInitials(member.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-[#0B2256] truncate">{member.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        member.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {member.eligible ? 'Aktif' : member.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[#0B2256]">{member.member_no}</span>
                    <span>•</span>
                    <span>
                      {JOB_LABELS[member.job_category] ?? member.job_category}
                      {member.institution_name ? ` ${member.institution_name}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-auto px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 flex items-baseline gap-1.5 shrink-0">
                <span>Sisa Kuota:</span>
                <span className="text-lg font-bold text-[#0B2256] leading-none">{Math.max(remainingQuota, 0)}</span>
                <span>/ {member.quota.max} Buku</span>
              </div>
            </div>
          )}

          {member && !member.eligible && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Tidak dapat meminjam: {member.block_reason}</span>
            </div>
          )}
        </section>

        {/* Step 2: Scan Buku */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <StepHeader
            number={2}
            title="Scan Buku / Eksemplar"
            subtitle="Scan label barcode, atau cari judul/pengarang untuk buku yang belum berlabel"
            action={
              <span className="px-2.5 py-1 rounded-full bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold shrink-0">
                {books.length} Buku Dipilih
              </span>
            }
          />

          <form onSubmit={handleAddBook} className="flex gap-2.5">
            <div className="relative flex-1">
              <ScanBarcode className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={bookInputRef}
                value={barcode}
                onChange={(e) => handleBookInputChange(e.target.value)}
                onKeyDown={handleBookKeyDown}
                onBlur={() => setTimeout(closeSuggestions, 150)}
                disabled={!canScan}
                autoComplete="off"
                role="combobox"
                aria-expanded={suggestOpen}
                aria-controls="book-suggestions"
                placeholder={
                  !member
                    ? 'Identifikasi anggota terlebih dahulu...'
                    : canScan
                      ? 'Scan barcode atau ketik judul / pengarang buku...'
                      : 'Kuota pinjam anggota sudah terpenuhi'
                }
                className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border-2 border-[#0B2256] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:border-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              {suggestLoading && (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}

              {suggestOpen && !suggestLoading && (suggestions.length > 0 || suggestMessage) && (
                <div
                  id="book-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
                >
                  {suggestions.length > 0 ? (
                    <>
                      <p className="px-4 pt-2.5 pb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        Eksemplar tersedia ({suggestions.length})
                      </p>
                      <ul className="max-h-72 overflow-y-auto pb-1.5">
                        {suggestions.map((item, idx) => (
                          <li key={item.barcode_no} role="option" aria-selected={idx === activeIndex}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => addBookByBarcode(item.barcode_no)}
                              className={`w-full text-left px-4 py-2.5 flex items-start gap-3 cursor-pointer ${
                                idx === activeIndex ? 'bg-[#EEF3FA]' : ''
                              }`}
                            >
                              <BookOpen className="w-4 h-4 text-[#0B2256] mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#0B2256] truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {item.author || 'Tanpa pengarang'}
                                  {item.call_number ? ` • Panggil: ${item.call_number}` : ''}
                                  {item.location ? ` • ${item.location}` : ''}
                                </p>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold font-mono shrink-0">
                                {item.barcode_no}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p className="px-4 py-2 border-t border-slate-100 text-[10px] text-slate-500">
                        ↑↓ pilih • Enter tambahkan • Esc tutup. Cocokkan no. panggil dengan buku fisik.
                      </p>
                    </>
                  ) : (
                    <p className="px-4 py-3 text-xs text-slate-500">{suggestMessage}</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!canScan || bookLoading || !barcode.trim()}
              className="h-11 px-5 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">Tambah Buku</span>
            </button>
          </form>

          {bookError && (
            <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{bookError}</span>
            </div>
          )}

          {books.length > 0 && (
            <ul className="mt-4 rounded-xl border border-slate-200 divide-y divide-slate-200">
              {books.map((book) => (
                <li key={book.barcode_no} className="flex items-center gap-3.5 px-4 py-3.5">
                  <BookOpen className="w-6 h-6 text-[#0B2256] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold font-mono">
                        {book.barcode_no}
                      </span>
                      <span className="text-sm font-semibold text-[#0B2256] truncate">{book.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {book.author || 'Tanpa pengarang'}
                      {book.call_number ? ` • Panggil: ${book.call_number}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBook(book.barcode_no)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    aria-label={`Hapus ${book.title}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {receipt && books.length === 0 && (
            <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Transaksi berhasil: {receipt.loans.length} buku dipinjam oleh {receipt.member.name}.
                </p>
                <p className="mt-0.5 font-mono">{receipt.loans.map((loan) => loan.loan_number).join(', ')}</p>
              </div>
            </div>
          )}
        </section>

        {/* Step 3: Durasi & Konfirmasi */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <StepHeader
            number={3}
            title="Durasi & Konfirmasi Peminjaman"
            subtitle="Tentukan jangka waktu pinjam dan selesaikan transaksi"
          />

          <p className="text-xs font-semibold text-slate-700 mb-2">Durasi Peminjaman</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {DURATION_PRESETS.map((preset) => {
              const active = duration === preset.days
              return (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setDuration(preset.days)}
                  className={`h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0B2256] text-white'
                      : 'bg-[#EEF3FA] text-slate-700 hover:bg-[#DCE6F7] border border-slate-200'
                  }`}
                >
                  {active && <Check className="w-4 h-4" />}
                  {preset.label}
                </button>
              )
            })}
            <label
              className={`h-11 rounded-xl px-3.5 flex items-center gap-2 text-xs text-slate-500 border ${
                isPreset ? 'bg-[#EEF3FA] border-slate-200' : 'bg-white border-[#0B2256]'
              }`}
            >
              <span>Kustom:</span>
              <input
                type="number"
                min={1}
                max={MAX_DURATION}
                value={duration || ''}
                onChange={(e) => handleCustomDuration(e.target.value)}
                className="w-14 h-7 px-2 rounded-md bg-white border border-slate-200 text-xs font-bold text-[#0B2256] focus:outline-none focus:border-[#0B2256]"
              />
              <span>Hari</span>
            </label>
          </div>

          <div className="mt-4 rounded-xl bg-[#EEF3FA] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CalendarDays className="w-4 h-4 text-[#0B2256]" />
              <span>Tanggal Pinjam:</span>
              <span className="font-bold text-slate-800">{formatDate(today)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CalendarCheck className="w-4 h-4 text-teal-700" />
              <span>Jatuh Tempo:</span>
              <span className="text-lg font-bold text-teal-700">
                {duration >= 1 ? formatDate(dueDate, 'long') : '-'}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 h-12 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{submitting ? 'Memproses...' : 'Konfirmasi Peminjaman'}</span>
            </button>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => receipt && printReceipt(receipt)}
                disabled={!receipt}
                title={receipt ? 'Cetak struk transaksi terakhir' : 'Struk tersedia setelah transaksi berhasil'}
                className="flex-1 sm:flex-none h-12 px-5 rounded-xl bg-[#DCE6F7] hover:bg-[#CCDAF2] text-[#0B2256] text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-4 rounded-xl text-slate-600 hover:text-[#0B2256] hover:bg-slate-100 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
