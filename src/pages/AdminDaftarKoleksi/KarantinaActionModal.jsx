import { useState, useEffect } from 'react'
import {
  X,
  Archive,
  AlertTriangle,
  FileSpreadsheet,
  Copy,
  Trash2,
  Wrench,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react'

export default function KarantinaActionModal({
  isOpen,
  onClose,
  itemsToQuarantine = [],
  onConfirmQuarantine,
}) {
  const [selectedReason, setSelectedReason] = useState(
    'Belum Dilengkapi No Klasifikasi DDC'
  )
  const [category, setCategory] = useState('data_belum_lengkap')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('Prioritas 1')

  // Reset form when modal opens with new items
  useEffect(() => {
    if (isOpen) {
      setSelectedReason('Belum Dilengkapi No Klasifikasi DDC')
      setCategory('data_belum_lengkap')
      setNotes('')
      setPriority('Prioritas 1')
    }
  }, [isOpen])

  if (!isOpen || !itemsToQuarantine || itemsToQuarantine.length === 0) return null

  const isBulk = itemsToQuarantine.length > 1
  const singleItem = itemsToQuarantine[0]

  const reasonPresets = [
    {
      label: 'Belum Dilengkapi No Klasifikasi DDC / Rak',
      category: 'data_belum_lengkap',
      priority: 'Prioritas 1',
      icon: FileSpreadsheet,
      desc: 'Buku belum memiliki nomor panggil rak atau DDC, tidak layak tampil di OPAC.',
    },
    {
      label: 'Duplikasi Terdeteksi (ISBN / Judul Kembar)',
      category: 'duplikasi',
      priority: 'Prioritas 2',
      icon: Copy,
      desc: 'Ditemukan entri identik dengan katalog master yang sudah ada sebelumnya.',
    },
    {
      label: 'Koleksi Rusak Fisik / Perlu Binding / Jilid Ulang',
      category: 'data_belum_lengkap',
      priority: 'Prioritas 1',
      icon: Wrench,
      desc: 'Buku fisik robek, lepas lembar, atau basah sehingga ditarik dari rak sirkulasi.',
    },
    {
      label: 'Dihapus Sementara / Usulan Write-Off (> 30 Hari)',
      category: 'dihapus_sementara',
      priority: 'Prioritas 3',
      icon: Trash2,
      desc: 'Buku hilang atau rusak permanen, masuk masa retensi audit aset daerah.',
    },
  ]

  const handleSelectPreset = (preset) => {
    setSelectedReason(preset.label)
    setCategory(preset.category)
    setPriority(preset.priority)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirmQuarantine({
      items: itemsToQuarantine,
      reason: selectedReason,
      category,
      priority,
      notes: notes.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-[#0B2256] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Archive className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {isBulk
                  ? `Masukkan ${itemsToQuarantine.length} Koleksi ke Keranjang Karantina`
                  : 'Masukkan Koleksi ke Keranjang Karantina'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Penyaringan integritas data sebelum terbit ke OPAC umum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
          {/* Ringkasan Koleksi Terpilih */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              {isBulk ? 'Daftar Koleksi Terpilih' : 'Informasi Koleksi'}
            </span>
            {isBulk ? (
              <div className="space-y-1">
                <p className="font-bold text-[#0B2256]">
                  {itemsToQuarantine.length} Judul / Eksemplar dipilih untuk dikarantina
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px] text-slate-600">
                  {itemsToQuarantine.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-slate-200">
                      <span className="truncate max-w-[320px] font-medium">{item.title}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{item.barcode || item.bibid || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-sm text-[#0B2256] leading-snug">
                  {singleItem.title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 mt-1 text-[11px]">
                  <span>👤 {singleItem.author || 'Pengarang Utama'}</span>
                  <span>🏷️ Barcode: <strong className="font-mono text-slate-700">{singleItem.barcode || singleItem.barcode_no || '-'}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Pilihan Alasan Cepat (Presets) */}
          <div className="space-y-2">
            <label className="block text-slate-700 font-bold">
              Pilih Alasan Karantina <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {reasonPresets.map((preset, pIdx) => {
                const Icon = preset.icon
                const isSelected = selectedReason === preset.label

                return (
                  <div
                    key={pIdx}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#0B2256] bg-blue-50/60 ring-1 ring-[#0B2256]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quarantine_reason"
                      checked={isSelected}
                      onChange={() => handleSelectPreset(preset)}
                      className="mt-0.5 w-4 h-4 text-[#0B2256] focus:ring-[#0B2256] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">
                          {preset.label}
                        </span>
                        <span
                          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded ${
                            preset.priority === 'Prioritas 1'
                              ? 'bg-amber-100 text-amber-800'
                              : preset.priority === 'Prioritas 2'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {preset.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Catatan / Keterangan Tambahan */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Catatan / Keterangan Khusus Pustakawan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Menunggu keputusan rapat pengadaan / Eksemplar basah saat pengembalian..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] resize-none"
            />
          </div>

          {/* Info Banner Dampak Bisnis */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Dampak Bisnis:</strong> Rekaman ini akan disembunyikan dari portal publik OPAC dan dinonaktifkan dari transaksi peminjaman sirkulasi sampai divalidasi kembali.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B2256] hover:bg-blue-950 text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Archive className="w-4 h-4" />
              <span>Konfirmasi Masukkan ke Karantina</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
