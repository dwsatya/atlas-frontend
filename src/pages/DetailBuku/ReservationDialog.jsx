import { useEffect, useState } from 'react'
import { BookMarked, CalendarClock, CheckCircle2, Copy, Loader2, PackageCheck, Users, X } from 'lucide-react'

/**
 * Overlay tengah untuk konfirmasi & hasil reservasi buku (gaya seragam dengan popup Logout).
 * mode: 'confirm' | 'success'
 */
export default function ReservationDialog({ mode, book, reservation, submitting, onClose, onConfirm, onViewReservations }) {
  const [copied, setCopied] = useState(false)

  // Tutup dengan tombol Escape (kecuali saat proses pengiriman)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, submitting])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(reservation.reservation_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard tidak tersedia; kode tetap terlihat di layar
    }
  }

  const isSuccess = mode === 'success'

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
            isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-[#002B66]'
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-7 h-7 stroke-[2.2]" /> : <BookMarked className="w-6 h-6 stroke-[2.2]" />}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight">
          {isSuccess ? 'Reservasi Berhasil!' : 'Konfirmasi Reservasi Buku'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {isSuccess
            ? 'Simpan kode berikut dan tunjukkan di meja sirkulasi saat buku siap diambil.'
            : 'Pastikan buku yang Anda pilih sudah sesuai sebelum melanjutkan.'}
        </p>

        {/* Kartu Buku */}
        <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-center gap-3 text-left">
          <div className="w-10 h-12 rounded-lg bg-white border border-slate-200 text-[#002B66] flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#032360] line-clamp-2">{book.title}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {book.author_main || book.author || 'Penulis tidak diketahui'}
              {book.publisher ? ` • ${book.publisher}` : ''}
            </p>
          </div>
        </div>

        {isSuccess ? (
          <>
            <button
              type="button"
              onClick={copyCode}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 px-4 py-3 cursor-pointer transition-colors"
            >
              <span className="block text-[10px] font-bold tracking-wider text-indigo-500 uppercase">Kode Reservasi</span>
              <span className="mt-1 flex items-center justify-center gap-2 font-mono text-xl font-extrabold text-[#032360]">
                {reservation.reservation_code}
                <Copy className="w-4 h-4 text-indigo-400" />
              </span>
              <span className="block text-[10px] text-indigo-500 mt-0.5">{copied ? 'Tersalin!' : 'Klik untuk menyalin'}</span>
            </button>

            <ol className="mt-4 space-y-2 text-left text-[11.5px] text-slate-600">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                Petugas memverifikasi ketersediaan buku di rak.
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                Status berubah menjadi <b>Siap Diambil</b> di halaman Reservasi Saya.
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                Ambil buku maksimal 3 hari kerja dengan menunjukkan kode & kartu anggota.
              </li>
            </ol>
          </>
        ) : (
          <ul className="mt-4 space-y-2 text-left text-[11.5px] text-slate-600">
            <li className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-px" />
              Reservasi aktif mengurangi kuota pinjam Anda (maksimal 3 buku).
            </li>
            <li className="flex items-start gap-2.5">
              <PackageCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-px" />
              Petugas akan menyiapkan buku setelah diverifikasi di rak.
            </li>
            <li className="flex items-start gap-2.5">
              <CalendarClock className="w-4 h-4 text-amber-500 shrink-0 mt-px" />
              Buku wajib diambil maksimal 3 hari kerja setelah dinyatakan siap.
            </li>
          </ul>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isSuccess ? 'Tutup' : 'Batal'}
          </button>
          <button
            type="button"
            onClick={isSuccess ? onViewReservations : onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSuccess ? 'Lihat Reservasi Saya' : submitting ? 'Memproses...' : 'Ya, Reservasi'}
          </button>
        </div>
      </div>
    </div>
  )
}
