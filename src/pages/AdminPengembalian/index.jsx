import { useState, useRef } from 'react'
import {
  AlertTriangle,
  Book,
  CheckCircle2,
  CircleCheck,
  Clock,
  Info,
  Library,
  Loader2,
  Printer,
  QrCode,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Square,
  SquareCheck,
  UserCircle2,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchReturnLookup, createReturnTransaction } from '../../services/api'

const CONDITIONS = ['Baik', 'Rusak Ringan', 'Rusak Berat']

const JOB_LABELS = { MAHASISWA: 'Mahasiswa', PELAJAR: 'Pelajar', UMUM: 'Umum' }

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const formatDate = (isoDate, month = 'short') =>
  isoDate
    ? new Date(`${isoDate}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' })
    : '-'

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

function printReturnReceipt(receipt) {
  const rows = receipt.loans
    .map(
      (loan, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${escapeHtml(loan.collection?.catalog?.title ?? '-')}</b><br/>
            <small>${escapeHtml(loan.collection?.barcode_no ?? '')} • Tempo ${escapeHtml(loan.due_date ?? '-')}</small></td>
          <td style="text-align:right">${loan.late_days > 0 ? `${loan.late_days} hr<br/>${formatRupiah(loan.fine_amount)}` : 'Tepat'}</td>
        </tr>`
    )
    .join('')

  const win = window.open('', '_blank', 'width=420,height=640')
  if (!win) return
  win.document.write(`<!doctype html><html><head><title>Bukti Pengembalian</title>
    <style>
      body{font-family:monospace;font-size:12px;padding:16px;color:#000}
      h1{font-size:14px;text-align:center;margin:0}
      p{margin:2px 0}.c{text-align:center}hr{border:0;border-top:1px dashed #000;margin:8px 0}
      table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:3px 2px}
    </style></head><body>
    <h1>ATLAS | DAPD Kab. Buleleng</h1>
    <p class="c">Bukti Pengembalian Buku</p><hr/>
    <p>Tanggal : ${escapeHtml(formatDate(receipt.date, 'long'))}</p>
    <p>Anggota : ${escapeHtml(receipt.member.name)}</p>
    <p>No. Agt : ${escapeHtml(receipt.member.member_no)}</p><hr/>
    <table>${rows}</table><hr/>
    <p>Total Eksemplar : <b>${receipt.loans.length}</b></p>
    <p>Total Denda     : <b>${formatRupiah(receipt.totalFine)}</b></p>
    <p>Petugas : ${escapeHtml(receipt.loans[0]?.returned_by ?? '-')}</p><hr/>
    <p class="c">Terima kasih telah mengembalikan<br/>koleksi perpustakaan.</p>
    </body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

export default function AdminPengembalian() {
  const [todayKey] = useState(() => toDateKey(new Date()))

  const [code, setCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState(null)

  const [member, setMember] = useState(null)
  const [items, setItems] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [toast, setToast] = useState(null)

  const inputRef = useRef(null)

  const selectedItems = items.filter((item) => item.selected)
  const estimatedFine = selectedItems.reduce((sum, item) => sum + item.fine_estimate, 0)
  const canSubmit = Boolean(member) && selectedItems.length > 0 && !submitting

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 50)

  const toItem = (loan, selected) => ({ ...loan, selected, condition: 'Baik' })

  const handleSearch = async (e) => {
    e?.preventDefault()
    const query = code.trim()
    if (!query) return

    setSearching(true)
    setNotice(null)

    try {
      const { data, message } = await fetchReturnLookup(query)
      const sameMember = member?.id === data.member.id

      if (data.type === 'collection') {
        if (member && !sameMember && items.length > 0) {
          setNotice({
            type: 'error',
            message: `Buku ${data.scanned_barcode} dipinjam oleh ${data.member.name} (${data.member.member_no}). Selesaikan atau reset transaksi anggota saat ini terlebih dahulu.`,
          })
          return
        }

        const loan = data.loans[0]
        setMember(data.member)
        setReceipt(null)
        setItems((prev) => {
          const base = sameMember ? prev : []
          return base.some((item) => item.loan_id === loan.loan_id)
            ? base.map((item) => (item.loan_id === loan.loan_id ? { ...item, selected: true } : item))
            : [...base, toItem(loan, true)]
        })
      } else {
        setMember(data.member)
        setReceipt(null)
        setItems((prev) =>
          data.loans.map((loan) => {
            const existing = sameMember && prev.find((item) => item.loan_id === loan.loan_id)
            return existing || toItem(loan, false)
          })
        )
        if (data.loans.length === 0) {
          setNotice({ type: 'info', message })
        }
      }

      setCode('')
    } catch (error) {
      setNotice({ type: 'error', message: error.message })
    } finally {
      setSearching(false)
      focusInput()
    }
  }

  const updateItem = (loanId, changes) => {
    setItems((prev) => prev.map((item) => (item.loan_id === loanId ? { ...item, ...changes } : item)))
  }

  const handleReset = () => {
    setCode('')
    setMember(null)
    setItems([])
    setNotice(null)
    setReceipt(null)
    focusInput()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    try {
      const result = await createReturnTransaction({
        member_no: member.member_no,
        items: selectedItems.map((item) => ({ barcode: item.barcode_no, condition: item.condition })),
      })
      const returnedIds = new Set(selectedItems.map((item) => item.loan_id))

      setReceipt({
        member,
        loans: result.data.loans,
        totalFine: result.data.total_fine,
        date: todayKey,
      })
      setMember(result.data.member)
      setItems((prev) => prev.filter((item) => !returnedIds.has(item.loan_id)))
      setNotice(null)
      showToast('success', result.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setSubmitting(false)
      focusInput()
    }
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2256] tracking-tight">Pengembalian Buku</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Pindai barcode eksemplar buku atau masukkan ID anggota untuk memproses pengembalian koleksi dan
            perhitungan denda.
          </p>
        </div>

        {/* Scan Panel */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <ScanLine className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Scan barcode eksemplar buku atau ketik ID anggota..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#EEF3FA] border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B2256] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !code.trim()}
              className="h-12 px-5 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              <span className="hidden sm:inline">Cari / Scan</span>
            </button>
          </form>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Info className="w-3.5 h-3.5" />
              <span>
                Atau cari berdasarkan ID Anggota ( <span className="font-mono font-bold text-[#0B2256]">MEM-...</span> )
              </span>
            </p>
            <span className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              RFID &amp; Barcode Scanner Aktif
            </span>
          </div>

          {notice && (
            <div
              className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold ${
                notice.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}
            >
              {notice.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
              <span>{notice.message}</span>
            </div>
          )}
        </section>

        {/* Member Card */}
        {member && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="w-12 h-12 rounded-xl bg-[#EEF3FA] text-[#0B2256] flex items-center justify-center shrink-0">
                <UserCircle2 className="w-7 h-7" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-[#0B2256]">{member.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold font-mono">
                    {member.member_no}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {JOB_LABELS[member.job_category] ?? member.job_category}
                  {member.institution_name ? ` ${member.institution_name}` : ''}
                </p>
              </div>
            </div>
            <span
              className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                member.sanction_free ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
              }`}
            >
              {member.sanction_free ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {member.sanction_free ? 'Status: Bebas Sanksi' : `Status: ${member.open_problems} Kasus Bermasalah`}
            </span>
          </section>
        )}

        {/* Returned Collections */}
        {member && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-base sm:text-lg font-semibold text-[#0B2256]">Koleksi yang Dikembalikan</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold">
                {items.length} Eksemplar
              </span>
            </div>

            {items.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-center text-xs text-slate-500">
                Tidak ada pinjaman aktif yang tersisa untuk anggota ini.
              </div>
            )}

            {items.map((item) => {
              const isLate = item.late_days > 0
              const dueLabel = item.due_date === todayKey ? 'Hari Ini' : formatDate(item.due_date)

              return (
                <article
                  key={item.loan_id}
                  className={`bg-white rounded-2xl border shadow-xs p-4 flex flex-col sm:flex-row gap-4 transition-colors ${
                    item.selected ? 'border-[#0B2256]/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-14 h-16 rounded-lg bg-[#EEF3FA] text-[#0B2256] flex flex-col items-center justify-center gap-1 shrink-0">
                      <Book className="w-5 h-5" />
                      <span className="text-[9px] text-slate-500 max-w-12 truncate">
                        {item.call_number?.split(' ')[0] || '-'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-[#DCE6F7] text-[#0B2256] text-[10px] font-bold font-mono">
                          {item.barcode_no}
                        </span>
                        {item.shelf && <span>Rak: {item.shelf}</span>}
                      </div>
                      <h3 className="text-base font-semibold text-[#0B2256] mt-1.5 leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.author || 'Tanpa pengarang'}
                        {item.publisher ? ` • ${item.publisher}` : ''}
                        {item.publish_year ? ` (${item.publish_year})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`flex items-center sm:justify-end gap-1 text-[11px] font-bold ${
                          isLate ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {isLate ? <Clock className="w-3.5 h-3.5" /> : <CircleCheck className="w-3.5 h-3.5" />}
                        {isLate
                          ? `Terlambat ${item.late_days} Hari • Denda ${formatRupiah(item.fine_estimate)}`
                          : 'Tepat Waktu (Bebas Denda)'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Jatuh Tempo: {dueLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.condition}
                        onChange={(e) => updateItem(item.loan_id, { condition: e.target.value })}
                        aria-label="Kondisi buku"
                        className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#0B2256]"
                      >
                        {CONDITIONS.map((condition) => (
                          <option key={condition} value={condition}>
                            Kondisi: {condition}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => updateItem(item.loan_id, { selected: !item.selected })}
                        aria-label={item.selected ? 'Batalkan pilihan' : 'Pilih untuk dikembalikan'}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          item.selected
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {item.selected ? <SquareCheck className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {receipt && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-bold">
              Pengembalian {receipt.loans.length} eksemplar oleh {receipt.member.name} berhasil diproses
              {receipt.totalFine > 0 ? ` • Total denda ${formatRupiah(receipt.totalFine)}` : ' • Bebas denda'}.
            </p>
          </div>
        )}

        {/* Summary & Actions */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="rounded-xl bg-[#EEF3FA] px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
              <div>
                <p className="text-xs text-slate-600">Total Buku Dikembalikan</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0B2256] leading-none">{selectedItems.length}</span>
                  <span className="text-lg text-slate-600">Eksemplar</span>
                </p>
              </div>
              {estimatedFine > 0 && (
                <div>
                  <p className="text-xs text-slate-600">Estimasi Denda Keterlambatan</p>
                  <p className="mt-1 text-xl font-extrabold text-rose-600 leading-none">{formatRupiah(estimatedFine)}</p>
                </div>
              )}
            </div>
            <span className="w-12 h-12 rounded-xl bg-white text-[#0B2256] flex items-center justify-center shrink-0">
              <Library className="w-6 h-6" />
            </span>
          </div>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="h-11 px-3 rounded-xl text-slate-600 hover:text-[#0B2256] hover:bg-slate-100 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Batal / Reset</span>
            </button>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => receipt && printReturnReceipt(receipt)}
                disabled={!receipt}
                title={receipt ? 'Cetak bukti pengembalian terakhir' : 'Bukti tersedia setelah pengembalian berhasil'}
                className="h-12 px-5 rounded-xl bg-[#DCE6F7] hover:bg-[#CCDAF2] text-[#0B2256] text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti Pengembalian</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="h-12 px-6 rounded-xl bg-[#0B2256] hover:bg-[#122e6e] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{submitting ? 'Memproses...' : 'Selesaikan Pengembalian'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
