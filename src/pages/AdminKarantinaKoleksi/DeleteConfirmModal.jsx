import { AlertTriangle, Trash2, X, RotateCw, BookOpen } from 'lucide-react'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  item = null,
  items = [],
  isLoading = false,
}) {
  if (!isOpen) return null

  const isBulk = Array.isArray(items) && items.length > 1
  const count = isBulk ? items.length : 1
  const currentItem = item || (items && items[0]) || null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!isLoading) onClose()
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Warning Hapus */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Judul Konfirmasi */}
        <h3 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight">
          {isBulk
            ? `Hapus Permanen ${count} Rekaman?`
            : 'Hapus Permanen Rekaman Ini?'}
        </h3>

        {/* Keterangan */}
        <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
          {isBulk
            ? `Tindakan ini akan menghapus ${count} rekaman katalog terpilih secara permanen dari sistem dan database perpustakaan.`
            : 'Tindakan ini akan menghapus rekaman katalog karantina secara permanen dari sistem dan database perpustakaan.'}
        </p>

        {/* Detail Rekaman yang akan Dihapus */}
        {!isBulk && currentItem && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                {currentItem.bibid}
              </span>
              {currentItem.category && (
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {currentItem.category.replace('_', ' ')}
                </span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#0B2256] leading-snug line-clamp-2">
                {currentItem.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Pengarang: <strong className="text-slate-800">{currentItem.author}</strong>
              </p>
            </div>

            {currentItem.quarantine_reason && (
              <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900">
                <span className="font-semibold">Alasan: </span>
                {currentItem.quarantine_reason}
              </div>
            )}
          </div>
        )}

        {/* List preview jika bulk delete */}
        {isBulk && (
          <div className="mb-4 max-h-40 overflow-y-auto space-y-1.5 text-left border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs">
            {items.slice(0, 5).map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-2 py-1 border-b border-slate-200/60 last:border-b-0"
              >
                <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 shrink-0">
                  {it.bibid}
                </span>
                <span className="truncate text-slate-800 font-medium">{it.title}</span>
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-[11px] text-slate-500 text-center pt-1 font-medium italic">
                ...dan {items.length - 5} rekaman lainnya
              </p>
            )}
          </div>
        )}

        {/* Warning Alert Note */}
        <div className="mb-6 p-3 rounded-xl bg-red-50/70 border border-red-200 text-left flex items-start gap-2.5 text-[11px] text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Peringatan:</strong> Data yang dihapus permanen{' '}
            <span className="underline font-semibold">tidak dapat dipulihkan</span> kembali.
          </p>
        </div>

        {/* Tombol Pilihan Aksi */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Permanen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
