import { X, HelpCircle, ShieldCheck, AlertTriangle, Copy, Trash2, CheckCircle2 } from 'lucide-react'

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B2256] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                Panduan Operasional &amp; Bisnis: Karantina Katalog
              </h3>
              <p className="text-[11px] text-slate-300">
                SOP Pengelolaan Data Bibliografi Tertahan — DAPD Kab. Buleleng
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900">
            <h4 className="font-bold text-xs text-[#0B2256] mb-1">
              Apa itu Modul Karantina Katalog?
            </h4>
            <p>
              Modul Karantina merupakan ruang isolasi digital untuk rekaman katalog bibliografis yang ditangguhkan atau belum memenuhi standar baku perpustakaan (seperti RDA, kelengkapan nomor panggil DDC, atau terdeteksi duplikasi). Katalog di sini <strong>disembunyikan dari OPAC publik dan peredaran peminjaman sirkulasi</strong> hingga staf perpustakaan memverifikasinya.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              4 Status Utama Karantina:
            </h4>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div>
                <strong className="text-slate-900 block">Total Karantina &amp; Perlu Validasi</strong>
                <span className="text-slate-600 text-[11px]">
                  Semua rekaman tertahan yang menunggu tindakan pustakawan. Prioritas 1 harus diselesaikan terlebih dahulu agar tidak menumpuk.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div>
                <strong className="text-slate-900 block">Duplikasi Terdeteksi (ISBN / Judul Sama)</strong>
                <span className="text-slate-600 text-[11px]">
                  Terjadi saat katalog diimpor atau diinput ganda. Gunakan aksi <em>Merge Duplikat</em> untuk menggabungkan eksemplar fisik ke rekaman master tanpa kehilangan data riwayat peminjaman.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs">
                3
              </div>
              <div>
                <strong className="text-slate-900 block">Data Belum Lengkap (Tanpa Call Number / DDC)</strong>
                <span className="text-slate-600 text-[11px]">
                  Katalog belum memiliki klasifikasi DDC atau nomor panggil rak. Pustakawan dapat mengisi nomor panggil dan langsung klik <em>Lengkapi &amp; Validasi</em> untuk memulihkannya ke OPAC.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs">
                4
              </div>
              <div>
                <strong className="text-slate-900 block">Dihapus Sementara (&gt; 30 Hari)</strong>
                <span className="text-slate-600 text-[11px]">
                  Katalog yang dihapus dari peredaran publik karena rusak/hilang. Setelah masa tenggang 30 hari, katalog siap untuk pembersihan permanen (write-off) dari database.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0B2256] hover:bg-blue-900 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
