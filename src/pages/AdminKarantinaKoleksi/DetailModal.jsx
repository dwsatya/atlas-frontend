import { useState } from 'react'
import {
  X,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Copy,
  Trash2,
  Calendar,
  Layers,
  Tag,
  Hash,
  Barcode,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Pencil,
  CheckCircle2,
  Sparkles,
  Globe,
} from 'lucide-react'

export default function DetailModal({
  item,
  isOpen,
  onClose,
  onRestore,
  onValidate,
  onMerge,
  onDelete,
}) {
  if (!isOpen || !item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-[#0B2256] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-amber-300">
                  {item.bibid}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.is_rda
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-500/30 text-slate-300 border border-slate-500/30'
                  }`}
                >
                  RDA: {item.is_rda ? 'Ya' : 'Tidak'}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                  {item.priority || 'Prioritas 1'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug mt-0.5">
                Rincian Rekaman Tertahan di Karantina
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Main Book Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-base font-bold text-[#0B2256] leading-snug mb-1">
              {item.title}
            </h4>
            <p className="text-slate-600 font-medium flex items-center gap-1.5">
              <span>Pengarang:</span>
              <strong className="text-slate-900">{item.author}</strong>
            </p>
            {item.barcode_no && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold">Identitas Eksemplar:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-xs font-bold">
                  {item.barcode_no}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                  Kondisi: {item.physical_condition || 'Rusak'}
                </span>
              </div>
            )}
          </div>

          {/* Reason Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900 text-xs uppercase tracking-wide">
                Alasan Penangguhan / Karantina
              </div>
              <p className="text-amber-800 font-semibold mt-0.5">
                {item.quarantine_reason}
              </p>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                {item.notes ||
                  'Katalog ini ditangguhkan dari sistem peredaran katalog publik OPAC untuk menjaga integritas data.'}
              </p>
            </div>
          </div>

          {/* Grid Metadata Bibliografis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Penerbitan &amp; Publikasi
              </span>
              <p className="font-semibold text-slate-800">{item.publisher}</p>
              <p className="text-slate-500">{item.publish_year}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Deskripsi Fisik &amp; Edisi
              </span>
              <p className="font-semibold text-slate-800">{item.physical_description}</p>
              <p className="text-slate-500">Edisi: {item.edition || '-'}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Standar ISBN
              </span>
              <p className="font-mono font-semibold text-slate-800">
                {item.isbn || 'Tidak tercantum'}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Subjek &amp; Klasifikasi
              </span>
              <p className="font-semibold text-slate-800">{item.subject || '-'}</p>
              <p className="text-slate-500 font-mono">
                DDC: {item.ddc || '(Kosong / Belum Diisi)'}
              </p>
            </div>
          </div>

          {/* Call Number & Eksemplar Status */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Nomor Panggil (Call Number)
              </span>
              <span className="font-mono font-bold text-sm text-[#0B2256]">
                {item.call_number || 'Belum Dibuat'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Eksemplar Fisik:</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {item.copies_count || 1} Eksemplar
              </span>
            </div>
          </div>

          {/* Duplicate Target Reference if any */}
          {item.duplicate_target_bibid && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Katalog Sasaran Duplikasi
                </span>
                <span className="font-mono font-bold text-blue-900">
                  Target: {item.duplicate_target_bibid}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose()
                  onMerge(item)
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0B2256] text-white font-semibold text-xs hover:bg-blue-900 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Buka Alat Merge</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onDelete(item)
            }}
            className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Permanen</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                onClose()
                onValidate(item)
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Lengkapi &amp; Validasi Data</span>
            </button>

            <button
              onClick={() => {
                onClose()
                onRestore(item)
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terbitkan ke OPAC</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
