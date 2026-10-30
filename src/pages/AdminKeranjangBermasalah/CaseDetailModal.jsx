import { useState } from 'react'
import {
  X,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  Printer,
  Calendar,
  Send,
  BookOpen,
  Building,
  Phone,
  ShieldAlert,
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
  const [officerName, setOfficerName] = useState('Petugas Sirkulasi')
  const [followupNotes, setFollowupNotes] = useState('')
  const [newActionNotes, setNewActionNotes] = useState(cart?.action_notes || '')
  const [resolutionNotes, setResolutionNotes] = useState('Koleksi/pelanggaran telah diselesaikan dan hak peminjaman anggota dipulihkan.')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!isOpen || !cart) return null

  const member = cart.member || {}
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
        action_status: 'AKSES_DIBEKUKAN', // Akses tindakan hanya Akses Dibekukan
        action_notes: newActionNotes.trim() || undefined,
      }
      const res = await addProblemFollowup(cart.id, payload)
      setMsg({ type: 'success', text: 'Catatan tindak lanjut berhasil ditambahkan!' })
      setFollowupNotes('')
      onUpdateSuccess?.(res.data)
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Gagal menyimpan tindak lanjut.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveCase = async () => {
    if (!window.confirm(`Yakin ingin menyelesaikan kasus ini dan memulihkan hak peminjaman ${member.name} kembali ke Entri Anggota?`)) {
      return
    }

    setLoading(true)
    setMsg(null)
    try {
      const res = await resolveProblemCart(cart.id, {
        notes: resolutionNotes,
        officer: officerName,
      })
      setMsg({ type: 'success', text: 'Kasus berhasil diselesaikan! Hak peminjaman anggota dipulihkan ke Entri Anggota.' })
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
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/90 text-white flex items-center justify-center border border-white/20 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Detail Kasus Sirkulasi #{cart.id}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  cart.is_resolved ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {cart.is_resolved ? 'SELESAI' : 'AKSES DIBEKUKAN'}
                </span>
              </div>
              <p className="text-[11px] text-[#A5C0EE]">
                {member.name || 'Anggota'} • {member.member_no || '-'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/80 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'detail'
                ? 'border-[#0B2256] text-[#0B2256]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ringkasan Kasus
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('followup')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'followup'
                ? 'border-[#0B2256] text-[#0B2256]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Riwayat Tindak Lanjut ({history.length})
          </button>
          {!cart.is_resolved && (
            <button
              type="button"
              onClick={() => setActiveTab('resolve')}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'resolve'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesaikan &amp; Pulihkan</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {msg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span>{msg.text}</span>
            </div>
          )}

          {/* TAB 1: RINGKASAN */}
          {activeTab === 'detail' && (
            <div className="space-y-4">
              {/* Member Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{member.name || '-'}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      No: {member.member_no || '-'} • {member.job_category || 'UMUM'} • {member.institution_name || '-'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      WhatsApp: {member.phone_number ? `+62 ${member.phone_number.replace(/^\+62|^0/, '')}` : '-'}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">TANGGAL LAPOR</span>
                  <span className="font-semibold text-slate-800">{cart.reported_date_formatted || cart.reported_date}</span>
                </div>
              </div>

              {/* Details Grid (Tanpa Denda/Cicilan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Koleksi / Buku Tertahan
                  </span>
                  <p className="font-bold text-slate-900">{cart.item_title || 'Tidak Terkait Buku'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Eksemplar: {cart.item_barcode || '-'} • Panggil: {cart.item_call_number || '-'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 space-y-1">
                  <span className="text-rose-600 text-[10px] uppercase font-bold tracking-wider">
                    Status Sanksi Tindakan
                  </span>
                  <p className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    {cart.is_resolved ? 'Akses Telah Dipulihkan' : 'Akses Dibekukan'}
                  </p>
                  <p className="text-[11px] text-rose-700">
                    {cart.action_notes || 'Hak peminjaman koleksi ditangguhkan sampai masalah diselesaikan.'}
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

          {/* TAB 2: RIWAYAT TINDAK LANJUT (Tanpa Cicilan Uang) */}
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
                    + Catat Tindak Lanjut Baru:
                  </span>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Bentuk Tindakan Petugas</label>
                    <select
                      value={followupAction}
                      onChange={(e) => setFollowupAction(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                    >
                      <option value="Panggilan WhatsApp">Panggilan / Chat WhatsApp</option>
                      <option value="Konfirmasi Pengembalian Buku">Konfirmasi Pengembalian Buku</option>
                      <option value="Penerimaan Buku Pengganti">Penerimaan Buku Pengganti</option>
                      <option value="Mediasi Loket">Mediasi Langsung di Loket Sirkulasi</option>
                      <option value="Verifikasi Berkas Identitas">Verifikasi Berkas Identitas / NIK</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Catatan Komunikasi / Hasil Pertemuan</label>
                    <textarea
                      rows="2"
                      value={followupNotes}
                      onChange={(e) => setFollowupNotes(e.target.value)}
                      placeholder="Masukkan keterangan hasil komunikasi atau kesepakatan pengembalian/penggantian buku..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Status Tindakan</label>
                    <input
                      type="text"
                      disabled
                      value="Akses Dibekukan"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-xl bg-[#0B2256] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#112d6e] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Menyimpan...' : 'Simpan Catatan Tindak Lanjut'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SELESAIKAN KASUS & PULIHKAN KE ENTRI ANGGOTA */}
          {activeTab === 'resolve' && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Selesaikan Permasalahan &amp; Pulihkan Akses</h4>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    Tindakan ini akan menandai kasus selesai. Status anggota akan pulih menjadi <b>Aktif Bebas Pustaka</b> dan <b>otomatis muncul kembali di daftar Entri Anggota</b>.
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
                <span>{loading ? 'Memproses...' : 'Tandai Selesai & Pulihkan ke Entri Anggota'}</span>
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
