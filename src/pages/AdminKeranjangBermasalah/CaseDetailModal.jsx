import { useState } from 'react'
import {
  X,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Printer,
  Calendar,
  Send,
  BookOpen,
  Building,
  Phone,
} from 'lucide-react'
import { addProblemFollowup, resolveProblemCart } from '../../services/api'

export default function CaseDetailModal({
  isOpen,
  onClose,
  cart,
  onUpdateSuccess,
  onOpenPrint,
  onOpenWhatsApp,
}) {
  const [activeTab, setActiveTab] = useState('detail') // 'detail' | 'followup' | 'resolve'
  const [followupAction, setFollowupAction] = useState('Panggilan WhatsApp')
  const [officerName, setOfficerName] = useState('Ridwan Surasta')
  const [followupNotes, setFollowupNotes] = useState('')
  const [paymentAdd, setPaymentAdd] = useState('')
  const [newActionStatus, setNewActionStatus] = useState(cart?.action_status || 'AKSES_DIBEKUKAN')
  const [newActionNotes, setNewActionNotes] = useState(cart?.action_notes || '')
  const [resolutionNotes, setResolutionNotes] = useState('Kewajiban telah diselesaikan secara penuh dan hak peminjaman dipulihkan.')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!isOpen || !cart) return null

  const member = cart.member || {}
  const fine = Number(cart.fine_amount || 0)
  const paid = Number(cart.paid_amount || 0)
  const remaining = Math.max(0, fine - paid)
  const history = Array.isArray(cart.followup_history) ? cart.followup_history : []

  const handleAddFollowup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const payload = {
        action: followupAction,
        officer: officerName,
        notes: followupNotes.trim() || undefined,
        payment_add: paymentAdd ? parseFloat(paymentAdd) : undefined,
        action_status: newActionStatus,
        action_notes: newActionNotes.trim() || undefined,
      }
      const res = await addProblemFollowup(cart.id, payload)
      setMsg({ type: 'success', text: 'Catatan tindak lanjut berhasil ditambahkan!' })
      setFollowupNotes('')
      setPaymentAdd('')
      onUpdateSuccess?.(res.data)
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyimpan tindak lanjut.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveCase = async () => {
    if (!window.confirm(`Yakin ingin menandai kasus ini SELESAI dan memulihkan hak peminjaman untuk ${member.name}?`)) {
      return
    }

    setLoading(true)
    setMsg(null)
    try {
      const res = await resolveProblemCart(cart.id, {
        notes: resolutionNotes,
        officer: officerName,
      })
      setMsg({ type: 'success', text: 'Kasus berhasil diselesaikan!' })
      onUpdateSuccess?.(res.data)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyelesaikan kasus.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Rincian &amp; Penanganan Kasus Bermasalah
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                ID Kasus #{String(cart.id).padStart(4, '0')} • {cart.problem_type_label || cart.problem_type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab('detail')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-all ${activeTab === 'detail'
                ? 'border-[#0B2256] text-[#0B2256] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Detail Kasus &amp; Koleksi
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`pb-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === 'followup'
                ? 'border-[#0B2256] text-[#0B2256] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span>Riwayat Tindak Lanjut</span>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center">
              {history.length}
            </span>
          </button>
          {!cart.is_resolved && (
            <button
              onClick={() => setActiveTab('resolve')}
              className={`pb-2.5 border-b-2 cursor-pointer transition-all text-emerald-700 ${activeTab === 'resolve'
                  ? 'border-emerald-600 font-bold'
                  : 'border-transparent hover:text-emerald-800'
                }`}
            >
              Penyelesaian Kasus (Resolve)
            </button>
          )}
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`px-6 py-2.5 text-xs font-medium ${msg.type === 'error'
                ? 'bg-rose-50 border-b border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-b border-emerald-200 text-emerald-700'
              }`}
          >
            {msg.text}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-5">
          {/* TAB 1: DETAIL KASUS */}
          {activeTab === 'detail' && (
            <div className="space-y-4">
              {/* Member Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-200">
                  {member.name ? member.name.charAt(0) : 'A'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{member.name || '-'}</h4>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {member.member_no}
                    </span>
                  </div>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {member.institution_name || '-'} • Kategori: <span className="font-semibold uppercase">{member.job_category || 'UMUM'}</span>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {member.phone_number || 'Tidak ada no WA'}
                  </p>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-900 flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-rose-600 block">
                    Status Penanganan Saat Ini:
                  </span>
                  <span className="font-extrabold text-sm text-rose-800">
                    {cart.action_status_label || cart.action_status}
                  </span>
                  <p className="text-xs text-rose-700 mt-0.5">{cart.action_notes || 'Menunggu verifikasi'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-medium block">Tanggal Kasus:</span>
                  <span className="font-semibold text-slate-800">{cart.reported_date_formatted || cart.reported_date}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Koleksi / Buku Tertahan
                  </span>
                  <p className="font-bold text-slate-900">{cart.item_title || '-'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Eksemplar: {cart.item_barcode || '-'} • Panggil: {cart.item_call_number || '-'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Rincian Keuangan &amp; Tagihan
                  </span>
                  <p className="font-bold text-slate-900 text-sm font-mono">
                    Total Denda: Rp {fine.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold font-mono">
                    Cicilan Masuk: Rp {paid.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] font-bold text-rose-700 font-mono">
                    Sisa Tertunggak: Rp {remaining.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-slate-500 text-[11px] font-bold">Kronologi / Catatan Pemeriksaan:</span>
                <p className="text-slate-700 leading-relaxed font-normal">
                  {cart.description || 'Tidak ada catatan kronologi terlampir.'}
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Petugas Pemeriksa: <span className="font-semibold text-slate-600">{cart.handled_by || '-'}</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT TINDAK LANJUT */}
          {activeTab === 'followup' && (
            <div className="space-y-5">
              {/* Timeline Items */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 text-xs">Timeline Tindak Lanjut Petugas:</span>
                {history.length === 0 ? (
                  <p className="p-4 rounded-xl border border-slate-200 text-center text-slate-400">
                    Belum ada riwayat tindak lanjut yang dicatat.
                  </p>
                ) : (
                  <div className="space-y-2.5 border-l-2 border-blue-200 pl-4 ml-2">
                    {history.map((h, idx) => (
                      <div key={idx} className="relative space-y-1 pb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1 border-2 border-white shadow-xs" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{h.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{h.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{h.notes}</p>
                        {h.payment_made && (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] font-mono border border-emerald-200">
                            + Pembayaran Rp {Number(h.payment_made).toLocaleString('id-ID')}
                          </span>
                        )}
                        <p className="text-[10px] text-slate-400">Petugas: {h.officer || '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Tambah Tindak Lanjut */}
              {!cart.is_resolved && (
                <form onSubmit={handleAddFollowup} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <span className="font-bold text-slate-900 text-xs block">
                    + Catat Tindak Lanjut Baru / Input Cicilan:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium">Bentuk Tindakan</label>
                      <select
                        value={followupAction}
                        onChange={(e) => setFollowupAction(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      >
                        <option value="Panggilan WhatsApp">Panggilan / Chat WhatsApp</option>
                        <option value="Surat Peringatan 1">Kirim Surat Peringatan ke-1</option>
                        <option value="Surat Peringatan 2">Kirim Surat Peringatan ke-2</option>
                        <option value="Mediasi Loket">Mediasi di Loket Sirkulasi</option>
                        <option value="Pembayaran Cicilan">Pembayaran Cicilan Denda/Ganti Rugi</option>
                        <option value="Penerimaan Pengganti">Penerimaan Buku Pengganti</option>
                        <option value="Verifikasi e-KTP">Verifikasi Berkas KTP</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium">Nominal Cicilan Tambahan (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        value={paymentAdd}
                        onChange={(e) => setPaymentAdd(e.target.value)}
                        placeholder="Contoh: 50000"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Catatan Tindak Lanjut</label>
                    <textarea
                      rows="2"
                      value={followupNotes}
                      onChange={(e) => setFollowupNotes(e.target.value)}
                      placeholder="Masukkan keterangan hasil komunikasi atau kesepakatan..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium">Perbarui Status Tindakan</label>
                      <select
                        value={newActionStatus}
                        onChange={(e) => setNewActionStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      >
                        <option value="AKSES_DIBEKUKAN">Akses Dibekukan</option>
                        <option value="PERINGATAN_2">Peringatan ke-2</option>
                        <option value="PERINGATAN_1">Peringatan ke-1</option>
                        <option value="DALAM_MEDIASI">Dalam Mediasi</option>
                        <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-medium">Subtext Keterangan Status</label>
                      <input
                        type="text"
                        value={newActionNotes}
                        onChange={(e) => setNewActionNotes(e.target.value)}
                        placeholder="Contoh: Sisa cicilan Rp 50.000..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-[#0B2256] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#112d6e] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: RESOLVE / PENYELESAIAN */}
          {activeTab === 'resolve' && !cart.is_resolved && (
            <div className="space-y-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Selesaikan Permasalahan Anggota</h4>
                  <p className="text-emerald-700 text-xs">
                    Tindakan ini akan menandai kasus selesai dan mengembalikan hak peminjaman pemustaka jika tidak ada kasus lain.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catatan Penyelesaian Kasus *</label>
                <textarea
                  rows="3"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleResolveCase}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Memproses...' : 'Tandai Selesai & Buka Blokir Hak Pinjam'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenWhatsApp?.(cart)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Notifikasi WA
            </button>
            <button
              type="button"
              onClick={() => onOpenPrint?.(cart)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Berita Acara
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
