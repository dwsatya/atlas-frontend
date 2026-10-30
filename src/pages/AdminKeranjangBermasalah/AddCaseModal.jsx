import { useState, useEffect } from 'react'
import {
  X,
  UserPlus,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Building,
  Phone,
  ShieldAlert,
  ArrowRight,
  BookX,
  Clock,
  Ban,
  Info,
} from 'lucide-react'
import { fetchAdminMembers, createProblemCart } from '../../services/api'

export default function AddCaseModal({ isOpen, onClose, onSuccess, initialMember = null }) {
  const [memberSearch, setMemberSearch] = useState('')
  const [membersList, setMembersList] = useState([])
  const [selectedMember, setSelectedMember] = useState(initialMember)
  const [isSearchingMember, setIsSearchingMember] = useState(false)

  // Form states (Kebijakan: Tidak ada denda uang)
  const [problemType, setProblemType] = useState('BUKU_HILANG')
  const [itemTitle, setItemTitle] = useState('')
  const [itemBarcode, setItemBarcode] = useState('')
  const [handledBy, setHandledBy] = useState('Petugas Sirkulasi')
  const [actionStatus, setActionStatus] = useState('AKSES_DIBEKUKAN')
  const [actionNotes, setActionNotes] = useState('Akses pinjam dibekukan sementara')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reset / Populate when modal opens
  useEffect(() => {
    if (isOpen) {
      setMemberSearch('')
      setSelectedMember(initialMember || null)
      setProblemType('BUKU_HILANG')
      setItemTitle('')
      setItemBarcode('')
      setHandledBy('Petugas Sirkulasi')
      setActionStatus('AKSES_DIBEKUKAN')
      setActionNotes('Akses pinjam dibekukan sementara')
      setDescription('')
      setError(null)
      if (!initialMember) {
        loadInitialMembers()
      }
    }
  }, [isOpen, initialMember])

  const problemOptions = [
    {
      id: 'BUKU_HILANG',
      label: 'Buku Hilang',
      desc: 'Koleksi hilang saat dipinjam, menunggu buku pengganti',
      Icon: BookX,
      iconColor: 'text-rose-600',
      defaultNotes: 'Menunggu buku pengganti dari pemustaka',
    },
    {
      id: 'TELAT',
      label: 'Keterlambatan Pengembalian',
      desc: 'Buku melewati batas waktu pinjam dan belum dikembalikan',
      Icon: Clock,
      iconColor: 'text-amber-600',
      defaultNotes: 'Terlambat mengembalikan koleksi perpustakaan',
    },
    {
      id: 'KOLEKSI_RUSAK',
      label: 'Koleksi Rusak / Cacat',
      desc: 'Buku robek, terkena air, atau halaman hilang',
      Icon: AlertTriangle,
      iconColor: 'text-orange-600',
      defaultNotes: 'Koleksi rusak saat dipinjam, hak pinjam ditangguhkan',
    },
    {
      id: 'LAINNYA',
      label: 'Pelanggaran Tata Tertib',
      desc: 'Pelanggaran aturan sirkulasi atau anomali identitas',
      Icon: Ban,
      iconColor: 'text-slate-600',
      defaultNotes: 'Pelanggaran tata tertib perpustakaan',
    },
  ]

  const handleSelectProblemType = (id, defNotes) => {
    setProblemType(id)
    setActionStatus('AKSES_DIBEKUKAN')
    setActionNotes(defNotes)
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
      setError('Pilih salah satu anggota perpustakaan yang bermasalah.')
      return
    }

    try {
      setLoading(true)
      const payload = {
        member_id: selectedMember.id,
        problem_type: problemType,
        item_title: itemTitle.trim() || undefined,
        item_barcode: itemBarcode.trim() || undefined,
        fine_amount: 0, // Tidak ada denda uang di perpustakaan
        paid_amount: 0,
        handled_by: handledBy.trim() || 'Petugas Sirkulasi',
        action_status: actionStatus,
        action_notes: actionNotes.trim() || undefined,
        late_duration_text: 'Perlu Tindak Lanjut',
        description: description.trim() || undefined,
        reported_date: new Date().toISOString().slice(0, 10),
      }

      await createProblemCart(payload)
      // Pass ID & Name to callback agar entri anggota langsung menghapus baris anggota tersebut
      onSuccess?.(selectedMember.id, selectedMember.name)
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
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bersih & Tegas */}
        <div className="px-6 py-4.5 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/90 text-white flex items-center justify-center border border-white/20 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Pindahkan ke Keranjang Bermasalah
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                Anggota akan langsung dikeluarkan dari daftar aktif sirkulasi
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

        {/* Body Ringkas & Efisien */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Profil Anggota yang Dipindahkan */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Anggota yang Bermasalah
            </span>

            {selectedMember ? (
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {selectedMember.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{selectedMember.name}</p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      <span className="font-bold text-blue-700">{selectedMember.member_no}</span>
                      <span> • </span>
                      <span>{selectedMember.institution_name || selectedMember.job_category || 'Anggota Perpustakaan'}</span>
                    </p>
                  </div>
                </div>
                {!initialMember && (
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-xs text-rose-700 hover:text-rose-900 font-semibold cursor-pointer underline"
                  >
                    Ganti
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={handleSearchMembers}
                    placeholder="Cari nama atau no. anggota..."
                    className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] outline-none"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                  {isSearchingMember ? (
                    <p className="p-3 text-center text-slate-400">Mencari anggota...</p>
                  ) : membersList.length === 0 ? (
                    <p className="p-3 text-center text-slate-400">Tidak ada anggota yang cocok.</p>
                  ) : (
                    membersList.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="p-2.5 px-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{m.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{m.member_no} • {m.job_category}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                          Pilih
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Jenis Masalah (Pilihan Cepat & Intuitif) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Pilih Jenis Permasalahan
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {problemOptions.map((opt) => {
                const isSelected = problemType === opt.id
                const OptionIcon = opt.Icon
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectProblemType(opt.id, opt.defaultNotes)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-rose-50/90 border-rose-400 text-rose-950 shadow-xs ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                      <OptionIcon className={`w-4 h-4 ${opt.iconColor}`} />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-xs">{opt.label}</p>
                      <p className="text-[10.5px] text-slate-500 leading-tight">{opt.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Detail Buku / Koleksi Terkait (Opsional) */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Detail Buku Terkait (Jika Kasus Mengenai Buku)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 space-y-1">
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Judul buku (opsional)..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] outline-none"
                />
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  value={itemBarcode}
                  onChange={(e) => setItemBarcode(e.target.value)}
                  placeholder="Barcode (opsional)..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-mono focus:ring-2 focus:ring-[#0B2256] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Catatan Petugas / Sanksi Singkat */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              3. Catatan Tindakan Sanksi
            </label>
            <input
              type="text"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Contoh: Menunggu buku pengganti..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-[#0B2256] outline-none"
            />
          </div>

          {/* Info Bisnis Ringkas */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Setelah dipindahkan, anggota <b>langsung hilang</b> dari tabel Entri Anggota dan masuk ke menu <b>Keranjang Bermasalah</b>. Hak pinjam anggota akan ditangguhkan hingga kasus diselesaikan.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{loading ? 'Memindahkan...' : 'Pindahkan ke Keranjang Bermasalah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
