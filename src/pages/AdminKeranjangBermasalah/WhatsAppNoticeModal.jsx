import { useState, useMemo } from 'react'
import { MessageSquare, ExternalLink, X, Copy, Check } from 'lucide-react'

export default function WhatsAppNoticeModal({ isOpen, onClose, cart }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !cart) return null

  const member = cart.member || {}
  const rawPhone = member.phone_number || ''
  const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62').replace(/^\+/, '')

  const defaultMessage = useMemo(() => {
    const memberName = member.name || 'Bapak/Ibu/Sdr(i)'
    const memberNo = member.member_no || '-'
    const title = cart.item_title || 'Koleksi Perpustakaan'
    const problem = cart.problem_type_label || cart.problem_type
    const notes = cart.action_notes || cart.description || 'Harap menyelesaikan administrasi koleksi di loket sirkulasi.'

    return `*LAYANAN SIRKULASI & TERTIB ANGGOTA DAPD KABUPATEN BULELENG*
Salam Literasi,

Yth. *${memberName}* (No. Anggota: *${memberNo}*),

Kami menginformasikan bahwa terdapat catatan administrasi sirkulasi pada akun keanggotaan Anda di Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng:

*Rincian Kasus Sirkulasi:*
• Jenis Permasalahan: *${problem}*
• Koleksi Terkait: *"${title}"*
• Eksemplar / No. Panggil: ${cart.item_barcode || '-'} (${cart.item_call_number || '-'})
• Status Tindakan: *Akses Dibekukan (Hak Pinjam Ditangguhkan)*
• Catatan Petugas: ${notes}

Demi tertib administrasi dan pemulihan hak peminjaman koleksi, mohon kehadiran Anda di Gedung Perpustakaan Daerah Kab. Buleleng (Jl. Veteran No. 23, Singaraja) pada jam kerja untuk menyelesaikan pengembalian atau penggantian koleksi terkait.

Terima kasih atas kerja sama dan perhatiannya.

_Pustakawan Pelaksana Sirkulasi DAPD Kab. Buleleng_`
  }, [member, cart])

  const [messageText, setMessageText] = useState(defaultMessage)

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waUrl = useMemo(() => {
    if (!cleanPhone) return null
    const target = cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone
    return `https://wa.me/${target}?text=${encodeURIComponent(messageText)}`
  }, [cleanPhone, messageText])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                Kirim Notifikasi WhatsApp Pemustaka
              </h3>
              <p className="text-[10px] text-blue-200">
                Peringatan sirkulasi resmi DAPD Buleleng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">{member.name}</p>
              <p className="text-[11px] font-mono text-slate-500">{member.member_no} • {member.institution_name}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {rawPhone || 'Tidak ada no WA'}
              </span>
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Pesan Pemberitahuan WhatsApp:</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Tersalin' : 'Salin Pesan'}
              </button>
            </div>
            <textarea
              rows="9"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-sans leading-relaxed focus:ring-2 focus:ring-[#0B2256] focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-white cursor-pointer"
          >
            Tutup
          </button>

          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Buka WhatsApp Web / App
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-rose-600 font-semibold">
              Nomor WhatsApp pemustaka tidak valid
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
