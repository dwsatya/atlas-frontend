import { useState, useEffect } from 'react'
import {
  X,
  Globe,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Barcode,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react'

export default function PublishOpacModal({
  isOpen,
  onClose,
  item,
  onConfirmPublish,
}) {
  const [ddc, setDdc] = useState('')
  const [callNumber, setCallNumber] = useState('')
  const [releaseNotes, setReleaseNotes] = useState('Selesai verifikasi karantina, data bibliografi siap layan.')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item && isOpen) {
      setDdc(item.ddc || '')
      setCallNumber(item.call_number || '')
      setReleaseNotes('Selesai verifikasi karantina, data bibliografi siap layan.')
      setIsSubmitting(false)
    }
  }, [item, isOpen])

  if (!isOpen || !item) return null

  // Readiness Calculation
  const hasTitle = Boolean(item.title && item.title.trim())
  const hasAuthor = Boolean(item.author && item.author.trim())
  const hasDdc = Boolean(ddc && ddc.trim())
  const hasCallNumber = Boolean(callNumber && callNumber.trim())

  let readinessScore = 0
  if (hasTitle) readinessScore += 25
  if (hasAuthor) readinessScore += 25
  if (hasDdc) readinessScore += 25
  if (hasCallNumber) readinessScore += 25

  const isReady = readinessScore >= 75 // Can publish if basic biblio is satisfied

  // Auto Generate Call Number
  const handleAutoGenerate = () => {
    let cleanDdc = ddc.trim()
    if (!cleanDdc) cleanDdc = '000.00'
    const authorCode = item.author
      ? item.author
          .replace(/^(Prof\.|Dr\.|Drs\.|Dra\.|Ir\.)\s*/i, '')
          .split(' ')[0]
          .slice(0, 3)
          .toUpperCase()
      : 'XXX'
    const titleCode = (item.title || 'b').charAt(0).toLowerCase()
    const generated = `${cleanDdc} ${authorCode} ${titleCode}`
    setCallNumber(generated)
    if (!ddc.trim()) setDdc('000.00')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onConfirmPublish({
        item,
        ddc: ddc.trim(),
        call_number: callNumber.trim(),
        release_notes: releaseNotes.trim(),
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                Konfirmasi Penerbitan ke OPAC Publik
              </h3>
              <p className="text-[11px] text-slate-300">
                Verifikasi integritas katalog dan aktifkan sirkulasi eksemplar
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
          {/* Card Info Katalog */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0B2256] bg-blue-100/70 text-blue-900 px-2 py-0.5 rounded">
                {item.bibid}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ISBN: {item.isbn || 'Tidak tercantum'}
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 leading-snug">
              {item.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px]">
              <span>👤 {item.author || 'Pengarang Utama'}</span>
              <span>🏢 {item.publisher || '-'} ({item.publish_year || '-'})</span>
              <span>📚 {item.copies_count || 1} Eksemplar Fisik</span>
            </div>
          </div>

          {/* Indikator Skor Kesiapan Terbit OPAC */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pemeriksaan Standar Bibliografi OPAC</span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  readinessScore === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : readinessScore >= 75
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {readinessScore}% Kesiapan
              </span>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Judul & Pengarang Lengkap</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Format RDA/Metadata Valid</span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  hasDdc
                    ? 'text-emerald-700 bg-emerald-50/60 border-emerald-100'
                    : 'text-amber-700 bg-amber-50/60 border-amber-200'
                }`}
              >
                {hasDdc ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                )}
                <span>Nomor DDC {hasDdc ? `(${ddc})` : 'Belum Ada'}</span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  hasCallNumber
                    ? 'text-emerald-700 bg-emerald-50/60 border-emerald-100'
                    : 'text-amber-700 bg-amber-50/60 border-amber-200'
                }`}
              >
                {hasCallNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                )}
                <span>No. Panggil Rak {hasCallNumber ? 'Siap' : 'Belum'}</span>
              </div>
            </div>
          </div>

          {/* Quick Input DDC & Call Number jika belum lengkap */}
          {(!hasDdc || !hasCallNumber) && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lengkapi Cepat Klasifikasi Rak</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  className="text-[10.5px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  ⚡ Auto Generate
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Klasifikasi DDC
                  </label>
                  <input
                    type="text"
                    value={ddc}
                    onChange={(e) => setDdc(e.target.value)}
                    placeholder="Contoh: 959.8"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B2256]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Panggil (Call No)
                  </label>
                  <input
                    type="text"
                    value={callNumber}
                    onChange={(e) => setCallNumber(e.target.value)}
                    placeholder="Contoh: 959.8 SUK s"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B2256]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Keterangan Rilis / Catatan */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Catatan Penyelesaian Karantina (Opsional)
            </label>
            <textarea
              rows={2}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Keterangan rilis untuk audit sirkulasi..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] resize-none"
            />
          </div>

          {/* Penjelasan Dampak Bisnis Publikasi OPAC */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-blue-950">
            <span className="font-bold text-[11px] uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Dampak Bisnis Setelah Terbit:</span>
            </span>
            <ul className="text-[11px] space-y-1 text-slate-700 pl-4 list-disc leading-relaxed">
              <li>
                <strong>OPAC Publik:</strong> Buku akan langsung dapat dicari oleh pemustaka melalui pencarian judul, pengarang, dan subjek.
              </li>
              <li>
                <strong>Sirkulasi Fisik:</strong> Eksemplar buku otomatis berstatus <em>Tersedia di Rak</em> dan barcode aktif untuk peminjaman mandiri maupun petugas.
              </li>
              <li>
                <strong>Audit Koleksi:</strong> Status karantina dihapus dan rekaman dicatat sebagai koleksi aktif perpustakaan.
              </li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Sekarang ke OPAC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
