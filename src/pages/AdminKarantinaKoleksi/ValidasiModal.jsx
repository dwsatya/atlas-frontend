import { useState, useEffect } from 'react'
import { X, CheckCircle, Pencil, BookOpen, AlertCircle, HelpCircle } from 'lucide-react'

export default function ValidasiModal({ item, isOpen, onClose, onSave }) {
  const [ddc, setDdc] = useState('')
  const [callNumber, setCallNumber] = useState('')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (item) {
      setDdc(item.ddc || '')
      setCallNumber(item.call_number || '')
      setSubject(item.subject || '')
      setNotes(item.notes || '')
    }
  }, [item])

  if (!isOpen || !item) return null

  // Auto generate call number suggestion if DDC & author exist
  const handleAutoGenerateCallNumber = () => {
    if (!ddc) return
    const authorCode = item.author
      ? item.author
          .replace(/^(Prof\.|Dr\.|Drs\.|Dra\.|Ir\.)\s*/i, '')
          .split(' ')[0]
          .slice(0, 3)
          .toUpperCase()
      : 'XXX'
    const titleCode = (item.title || 'b').charAt(0).toLowerCase()
    const generated = `${ddc} ${authorCode} ${titleCode}`
    setCallNumber(generated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...item,
      ddc,
      call_number: callNumber,
      subject,
      notes,
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
        {/* Header */}
        <div className="bg-[#0B2256] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <Pencil className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                Lengkapi &amp; Validasi Data Katalog
              </h3>
              <p className="text-[11px] text-slate-300">
                BIBID: <span className="font-mono text-amber-300">{item.bibid}</span> — {item.title}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              Setelah data DDC dan Nomor Panggil dilengkapi, katalog ini akan otomatis dikeluarkan dari karantina dan berstatus <strong>Aktif di OPAC Publik</strong>.
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Judul Buku &amp; Pengarang
            </label>
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-800 font-medium">
              <p className="font-bold">{item.title}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">👤 {item.author}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Klasifikasi DDC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ddc}
                onChange={(e) => setDdc(e.target.value)}
                placeholder="Contoh: 004.6 / 340.5"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] focus:border-transparent font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dewey Decimal Classification
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  Nomor Panggil (Call No) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCallNumber}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
                >
                  Generate Otomatis
                </button>
              </div>
              <input
                type="text"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="Contoh: 004.6 SUA m"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] focus:border-transparent font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Format: [DDC] [3 Huruf Pengarang] [Huruf Judul]
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Topik / Subjek Katalog
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Ilmu Komputer; Big Data; Komputasi"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Catatan Validasi Pustakawan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan penyesuaian metadata atau revisi..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] focus:border-transparent resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B2256] hover:bg-blue-900 text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Validasi &amp; Terbitkan ke OPAC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
