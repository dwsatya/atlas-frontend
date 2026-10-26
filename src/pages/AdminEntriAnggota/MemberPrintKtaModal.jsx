import { useState } from 'react'
import { X, Printer, Download, CreditCard, Check, Layers, Loader2 } from 'lucide-react'
import { KtaFront, KtaBack } from '../../components/KtaCard'
import { downloadKtaImage } from '../../utils/ktaImageGenerator'

export default function MemberPrintKtaModal({ isOpen, onClose, member }) {
  const [activeSide, setActiveSide] = useState('depan') // 'depan' | 'belakang' | 'keduanya'
  const [downloading, setDownloading] = useState(false)

  if (!isOpen || !member) return null

  const handleDownload = async (side) => {
    try {
      setDownloading(true)
      await downloadKtaImage({
        side: side,
        memberNo: member.member_no,
        name: member.name,
        photo: member.photo_path || member.photo_url || member.avatar,
        createdAt: member.created_at,
        locationName: 'DAPD Kab. Buleleng',
      })
    } catch (err) {
      console.error('Error downloading KTA:', err)
      alert('Gagal mendownload kartu anggota.')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Cetak Kartu Tanda Anggota (KTA)
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                {member.name} • {member.member_no}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveSide('depan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'depan'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sisi Depan
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('belakang')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'belakang'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sisi Belakang
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('keduanya')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSide === 'keduanya'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kedua Sisi
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Format Standar Kartu ISO/IEC 7810 (CR80)
          </div>
        </div>

        {/* Card Canvas Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/5 flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-full max-w-[520px] space-y-6">
            {(activeSide === 'depan' || activeSide === 'keduanya') && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tampak Depan (Identitas &amp; Barcode)
                </span>
                <div className="rounded-xl overflow-hidden shadow-xl border border-slate-300">
                  <KtaFront
                    memberNo={member.member_no}
                    name={member.name}
                    photo={member.photo_path || member.photo_url || member.avatar}
                    createdAt={member.created_at}
                    locationName="DAPD Kab. Buleleng"
                  />
                </div>
              </div>
            )}

            {(activeSide === 'belakang' || activeSide === 'keduanya') && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tampak Belakang (Tata Tertib &amp; Ketentuan)
                </span>
                <div className="rounded-xl overflow-hidden shadow-xl border border-slate-300">
                  <KtaBack />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
          >
            Tutup
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={downloading}
              onClick={() => handleDownload(activeSide)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-blue-600" />
              )}
              Download PNG ({activeSide === 'keduanya' ? 'Lengkap' : activeSide})
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
