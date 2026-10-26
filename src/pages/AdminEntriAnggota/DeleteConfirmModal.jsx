import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  member = null,
  isBulk = false,
  bulkCount = 0,
  loading = false,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Header Alert Visual */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border-4 border-rose-100">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3
            id="modal-headline"
            className="text-lg font-bold text-slate-800 tracking-tight"
          >
            {isBulk ? 'Konfirmasi Hapus Massal' : 'Konfirmasi Hapus Anggota'}
          </h3>

          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            {isBulk ? (
              <>
                Apakah Anda yakin ingin menghapus{' '}
                <span className="font-bold text-slate-700">{bulkCount} anggota terpilih</span>?
                Tindakan ini permanen dan data anggota tidak dapat dipulihkan kembali.
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menghapus data anggota{' '}
                <span className="font-bold text-slate-800">
                  {member?.name || 'ini'}
                </span>{' '}
                (<span className="font-mono text-blue-700 font-semibold">{member?.member_no || '-'}</span>)?
                Pastikan anggota tidak sedang memiliki tanggungan peminjaman buku aktif.
              </>
            )}
          </p>

          {!isBulk && member && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left border border-slate-200/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Instansi:</span>
                <span className="font-semibold text-slate-700">{member.institution_name || member.institution || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">No. WhatsApp:</span>
                <span className="font-semibold text-slate-700">{member.phone_number || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-600">{member.status || 'Aktif'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white hover:border-slate-400 active:scale-95 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{isBulk ? 'Hapus Terpilih' : 'Ya, Hapus Anggota'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
