import { useState } from 'react'
import { X, Copy, CheckCircle, ArrowRight, AlertTriangle, Layers } from 'lucide-react'

export default function MergeModal({ item, isOpen, onClose, onConfirmMerge }) {
  const [targetBibid, setTargetBibid] = useState(
    item?.duplicate_target_bibid || 'BIB-00120'
  )
  const [transferExemplars, setTransferExemplars] = useState(true)

  if (!isOpen || !item) return null

  const handleMerge = () => {
    onConfirmMerge(item, targetBibid, transferExemplars)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B2256] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Copy className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                Gabungkan / Merge Rekaman Duplikat
              </h3>
              <p className="text-[11px] text-slate-300">
                Penyelesaian duplikasi katalog bibliografi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              Katalog karantina ini memiliki data duplikat dengan rekaman lain di sistem. Proses merge akan memindahkan seluruh eksemplar fisik ke katalog sasaran, lalu menghapus entri duplikat ini dari karantina.
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sumber (Karantina) */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-rose-600 block">
                Rekaman Sumber (Akan Dihapus)
              </span>
              <div className="font-mono font-bold text-xs text-rose-700">
                {item.bibid}
              </div>
              <div className="font-semibold text-slate-800 line-clamp-2">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-500">
                {item.author}
              </div>
              <div className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded inline-block font-medium">
                {item.copies_count || 1} Eksemplar Terdaftar
              </div>
            </div>

            {/* Target (Master) */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">
                Rekaman Sasaran (Master OPAC)
              </span>
              <div className="font-mono font-bold text-xs text-emerald-700">
                Target: {targetBibid}
              </div>
              <div className="font-semibold text-slate-800 line-clamp-2">
                {item.title} (Entri Terverifikasi)
              </div>
              <div className="text-[11px] text-slate-500">
                {item.author}
              </div>
              <div className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded inline-block font-medium">
                Katalog Aktif di OPAC
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              BIBID Katalog Sasaran (Master)
            </label>
            <input
              type="text"
              value={targetBibid}
              onChange={(e) => setTargetBibid(e.target.value)}
              placeholder="Contoh: BIB-00120"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0B2256]"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={transferExemplars}
              onChange={(e) => setTransferExemplars(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B2256] focus:ring-[#0B2256]"
            />
            <div className="text-[11px]">
              <strong className="text-slate-800 block">
                Pindahkan barcode &amp; eksemplar fisik ke katalog sasaran
              </strong>
              <span className="text-slate-500">
                Koleksi fisik buku tetap tersimpan dan barcode dialihkan ke {targetBibid}.
              </span>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleMerge}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Eksekusi Penggabungan (Merge)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
