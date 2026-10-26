import { useState, useEffect } from 'react'
import {
  X,
  UserPlus,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  DollarSign,
  UserCheck,
  Building,
  Phone,
} from 'lucide-react'
import { fetchAdminMembers, createProblemCart } from '../../services/api'

export default function AddCaseModal({ isOpen, onClose, onSuccess }) {
  const [memberSearch, setMemberSearch] = useState('')
  const [membersList, setMembersList] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [isSearchingMember, setIsSearchingMember] = useState(false)

  // Form states
  const [problemType, setProblemType] = useState('BUKU_HILANG')
  const [itemTitle, setItemTitle] = useState('')
  const [itemBarcode, setItemBarcode] = useState('')
  const [itemCallNumber, setItemCallNumber] = useState('')
  const [fineAmount, setFineAmount] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [handledBy, setHandledBy] = useState('Ridwan Surasta')
  const [actionStatus, setActionStatus] = useState('AKSES_DIBEKUKAN')
  const [actionNotes, setActionNotes] = useState('Menunggu buku pengganti')
  const [lateDurationText, setLateDurationText] = useState('Perlu Tindak Lanjut')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reset when open
  useEffect(() => {
    if (isOpen) {
      setMemberSearch('')
      setSelectedMember(null)
      setProblemType('BUKU_HILANG')
      setItemTitle('')
      setItemBarcode('')
      setItemCallNumber('')
      setFineAmount('')
      setPaidAmount('')
      setHandledBy('Ridwan Surasta')
      setActionStatus('AKSES_DIBEKUKAN')
      setActionNotes('Menunggu buku pengganti')
      setLateDurationText('Perlu Tindak Lanjut')
      setDescription('')
      setError(null)
      loadInitialMembers()
    }
  }, [isOpen])

  // Update default action notes when problemType changes
  const handleProblemTypeChange = (val) => {
    setProblemType(val)
    if (val === 'BUKU_HILANG') {
      setActionStatus('AKSES_DIBEKUKAN')
      setActionNotes('Menunggu buku pengganti')
      setLateDurationText('Buku Hilang')
    } else if (val === 'TELAT') {
      setActionStatus('PERINGATAN_2')
      setActionNotes('Konfirmasi pengembalian tertunda')
      setLateDurationText('Terlambat Pengembalian')
    } else if (val === 'DENDA_MENUMPUK') {
      setActionStatus('DALAM_MEDIASI')
      setActionNotes('Belum Lunas Kasir')
      setLateDurationText('Tertunggak Kasir')
    } else if (val === 'KOLEKSI_RUSAK') {
      setActionStatus('AKSES_DIBEKUKAN')
      setActionNotes('Sanksi: Tidak Boleh Pinjam')
      setLateDurationText('Buku Disita Bag. Sirkulasi')
    } else if (val === 'ANOMALI_IDENTITAS') {
      setActionStatus('MENUNGGU_KONFIRMASI')
      setActionNotes('Wajib hadir langsung ke DAPD')
      setLateDurationText('Verifikasi Berkas KTP')
    } else {
      setActionStatus('PERINGATAN_1')
      setActionNotes('Peringatan tata tertib')
      setLateDurationText('Teguran Perpustakaan')
    }
  }

  const loadInitialMembers = async () => {
    try {
      setIsSearchingMember(true)
      const res = await fetchAdminMembers({ per_page: 8 })
      if (res?.data?.data) {
        setMembersList(res.data.data)
      }
    } catch (e) {
      console.warn('Could not load members for dropdown:', e)
    } finally {
      setIsSearchingMember(false)
    }
  }

  const handleSearchMembers = async (e) => {
    const q = e.target.value
    setMemberSearch(q)
    try {
      setIsSearchingMember(true)
      const res = await fetchAdminMembers({ search: q, per_page: 8 })
      if (res?.data?.data) {
        setMembersList(res.data.data)
      }
    } catch (e) {
      console.warn('Search member failed:', e)
    } finally {
      setIsSearchingMember(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!selectedMember) {
      setError('Pilih salah satu anggota terdaftar dari daftar di bawah.')
      return
    }

    try {
      setLoading(true)
      const payload = {
        member_id: selectedMember.id,
        problem_type: problemType,
        item_title: itemTitle.trim() || undefined,
        item_barcode: itemBarcode.trim() || undefined,
        item_call_number: itemCallNumber.trim() || undefined,
        fine_amount: fineAmount ? parseFloat(fineAmount) : 0,
        paid_amount: paidAmount ? parseFloat(paidAmount) : 0,
        handled_by: handledBy.trim() || 'Petugas Sirkulasi',
        action_status: actionStatus,
        action_notes: actionNotes.trim() || undefined,
        late_duration_text: lateDurationText.trim() || 'Perlu Tindak Lanjut',
        description: description.trim() || undefined,
        reported_date: new Date().toISOString().slice(0, 10),
      }

      await createProblemCart(payload)
      onSuccess?.('Kasus anggota bermasalah berhasil ditambahkan!')
      onClose()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kasus permasalahan anggota.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Masukkan Anggota ke Keranjang Bermasalah
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                Pencatatan kasus penangguhan hak pinjam &amp; pelanggaran sirkulasi
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pilih Anggota Terdaftar */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>1. Pilih Anggota Terdaftar (Wajib) *</span>
              {selectedMember && (
                <span className="text-emerald-700 font-normal flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Anggota Dipilih
                </span>
              )}
            </label>

            {/* Input Cari Anggota */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearch}
                onChange={handleSearchMembers}
                placeholder="Cari nama, no. anggota, atau no WhatsApp..."
                className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none"
              />
            </div>

            {/* Selected Member Preview Card */}
            {selectedMember ? (
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{selectedMember.name}</p>
                    <p className="text-[11px] text-blue-700 font-mono">
                      {selectedMember.member_no} • {selectedMember.job_category} • {selectedMember.institution_name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                {isSearchingMember ? (
                  <p className="p-3 text-center text-slate-400">Mencari anggota di database...</p>
                ) : membersList.length === 0 ? (
                  <p className="p-3 text-center text-slate-400">Tidak ada anggota yang cocok.</p>
                ) : (
                  membersList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="p-2.5 px-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {m.member_no} • {m.job_category} • {m.institution_name}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Pilih
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 2. Jenis Permasalahan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">2. Jenis Pelanggaran / Masalah *</label>
              <select
                value={problemType}
                onChange={(e) => handleProblemTypeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none"
              >
                <option value="BUKU_HILANG">Buku Hilang</option>
                <option value="TELAT">Keterlambatan / Telat</option>
                <option value="DENDA_MENUMPUK">Denda Menumpuk</option>
                <option value="KOLEKSI_RUSAK">Koleksi Rusak Berat</option>
                <option value="ANOMALI_IDENTITAS">Anomali NIK / Ganda</option>
                <option value="LAINNYA">Pelanggaran Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Status Tindakan Penanganan</label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none"
              >
                <option value="AKSES_DIBEKUKAN">Akses Dibekukan</option>
                <option value="PERINGATAN_2">Peringatan ke-2</option>
                <option value="PERINGATAN_1">Peringatan ke-1</option>
                <option value="DALAM_MEDIASI">Dalam Mediasi</option>
                <option value="MENUNGGU_KONFIRMASI">Menunggu Konfirmasi</option>
              </select>
            </div>
          </div>

          {/* 3. Detail Koleksi Buku Terkait */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Detail Buku / Eksemplar Terkait (Opsional)
            </span>

            <div className="space-y-1">
              <label className="text-slate-600 font-medium">Judul Buku / Subjek Kasus</label>
              <input
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Contoh: Pengantar Bioteknologi Tropis & Hayati Buleleng"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Barcode / No Eksemplar</label>
                <input
                  type="text"
                  value={itemBarcode}
                  onChange={(e) => setItemBarcode(e.target.value)}
                  placeholder="Contoh: EK-01994"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-mono focus:ring-2 focus:ring-[#0B2256] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-medium">No. Panggil Katalog</label>
                <input
                  type="text"
                  value={itemCallNumber}
                  onChange={(e) => setItemCallNumber(e.target.value)}
                  placeholder="Contoh: 570.2/ARI/p"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-mono focus:ring-2 focus:ring-[#0B2256] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Keuangan / Tagihan Denda & Cicilan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Nominal Denda / Tagihan (Rp)</label>
              <input
                type="number"
                min="0"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                placeholder="Contoh: 145000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0B2256] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Nominal Telah Dicicil / Terbayar (Rp)</label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="Contoh: 50000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0B2256] outline-none"
              />
            </div>
          </div>

          {/* 5. Petugas & Subtext Keterangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Petugas / Pustakawan Penanggung Jawab</label>
              <input
                type="text"
                value={handledBy}
                onChange={(e) => setHandledBy(e.target.value)}
                placeholder="Nama petugas..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Subtext Keterangan Status</label>
              <input
                type="text"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Contoh: Menunggu buku pengganti..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] outline-none"
              />
            </div>
          </div>

          {/* 6. Deskripsi / Kronologi Kasus */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800">Deskripsi / Kronologi Permasalahan</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan catatan kejadian, kondisi buku, atau alasan penangguhan hak pinjam..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs leading-relaxed focus:ring-2 focus:ring-[#0B2256] outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Menyimpan Kasus...' : 'Simpan ke Keranjang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
