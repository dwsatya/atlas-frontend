import { useEffect } from 'react'
import { BookMarked, CheckCircle2, Loader2, RotateCcw, Search, Undo2, Users, X, XCircle } from 'lucide-react'

/**
 * Overlay tengah untuk konfirmasi & hasil pembatalan reservasi (gaya seragam dengan popup Logout).
 * mode: 'confirm' | 'success'
 */
export default function CancelReservationDialog({ mode, item, submitting, onClose, onConfirm, onFindBooks }) {
  const isSuccess = mode === 'success'

  // Tutup dengan tombol Escape (kecuali saat proses pembatalan)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, submitting])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-14 h-14 mx-auto mb-4 rounded-full border flex items-center justify-center shadow-xs ${
            isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-7 h-7 stroke-[2.2]" /> : <XCircle className="w-7 h-7 stroke-[2.2]" />}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight">
          {isSuccess ? 'Reservasi Dibatalkan' : 'Batalkan Reservasi?'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {isSuccess
            ? 'Reservasi Anda telah dibatalkan dan kuota pinjam sudah dikembalikan.'
            : 'Tindakan ini tidak dapat diurungkan. Anda perlu membuat reservasi baru jika masih menginginkan buku ini.'}
        </p>

        {/* Kartu Reservasi */}
        <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center gap-3 text-left">
          <div className="w-10 h-12 rounded-lg bg-white border border-slate-200 text-[#002B66] flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#032360] line-clamp-2">{item.book.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{item.book.author || 'Penulis tidak diketahui'}</p>
            <p className={`mt-1 font-mono text-[11px] font-bold ${isSuccess ? 'text-slate-400 line-through' : 'text-indigo-600'}`}>
              {item.reservation_code}
            </p>
          </div>
        </div>

        {!isSuccess && (
          <ul className="mt-4 space-y-2 text-left text-[11.5px] text-slate-600">
            <li className="flex items-start gap-2.5">
              <Undo2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" />
              Kuota pinjam Anda dikembalikan 1 buku.
            </li>
            <li className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-px" />
              Buku kembali ke rak dan dapat direservasi anggota lain.
            </li>
            {item.state === 'ready' && (
              <li className="flex items-start gap-2.5 text-amber-700">
                <RotateCcw className="w-4 h-4 shrink-0 mt-px" />
                Buku ini sudah disiapkan petugas di loket untuk Anda.
              </li>
            )}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isSuccess ? 'Tutup' : 'Tidak, Kembali'}
          </button>
          {isSuccess ? (
            <button
              type="button"
              onClick={onFindBooks}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Cari Buku Lain
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {submitting ? 'Membatalkan...' : 'Ya, Batalkan'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
