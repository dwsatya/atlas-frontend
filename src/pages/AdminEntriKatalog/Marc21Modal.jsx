import { useState } from 'react'
import { X, Copy, Check, FileCode, Download, Eye } from 'lucide-react'

export default function Marc21Modal({ isOpen, onClose, formData }) {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'raw'

  if (!isOpen) return null

  // Generate MARC 21 tags based on formData
  const marcFields = [
    { tag: '000', ind: '  ', label: 'Leader', value: '01428nam a2200385 i 4500' },
    { tag: '008', ind: '  ', label: 'Fixed Data', value: '260916s2026    id |||||      000 0 ind d' },
    { tag: '020', ind: '  ', label: 'ISBN', subfields: [{ code: 'a', val: formData.isbn || '978-623-789-812-4' }] },
    { tag: '082', ind: '04', label: 'DDC Number', subfields: [{ code: 'a', val: formData.ddcNumber || '297.01' }, { code: '2', val: '23' }] },
    { tag: '084', ind: '  ', label: 'No. Panggil', subfields: [{ code: 'a', val: formData.callNumber || '297.01 SUR e' }] },
    {
      tag: '100',
      ind: formData.mainAuthorType === 'Nama Depan' ? '0 ' : '1 ',
      label: 'Main Entry - Personal Name',
      subfields: [{ code: 'a', val: formData.mainAuthor || 'Ridwan Surasta,' }, { code: 'e', val: 'penulis.' }],
    },
    {
      tag: '245',
      ind: formData.prefixWord === '-- Tidak diawali --' ? '10' : '14',
      label: 'Title Statement',
      subfields: [
        { code: 'a', val: formData.title || 'Pengantar Ilmu Falak' },
        ...(formData.subtitle ? [{ code: 'b', val: formData.subtitle }] : []),
        ...(formData.statementOfResponsibility ? [{ code: 'c', val: formData.statementOfResponsibility }] : []),
      ],
    },
    ...(formData.edition ? [{ tag: '250', ind: '  ', label: 'Edition Statement', subfields: [{ code: 'a', val: formData.edition }] }] : []),
    {
      tag: '264',
      ind: ' 1',
      label: 'Publication (Imprint)',
      subfields: [
        { code: 'a', val: formData.publishCity || 'Singaraja :' },
        { code: 'b', val: formData.publisher || 'Erlangga,' },
        { code: 'c', val: formData.publishYear || '2026.' },
      ],
    },
    {
      tag: '300',
      ind: '  ',
      label: 'Physical Description',
      subfields: [
        { code: 'a', val: formData.pages || 'xxiv, 312 hlm. :' },
        { code: 'b', val: formData.illustrations || 'ilus. , tabel, foto ;' },
        { code: 'c', val: formData.dimension || '24 cm.' },
      ],
    },
    ...(formData.notes
      ? [
          {
            tag: '520',
            ind: '3 ',
            label: 'Summary / Abstract',
            subfields: [{ code: 'a', val: formData.notes }],
          },
        ]
      : []),
    {
      tag: '650',
      ind: ' 4',
      label: 'Subject Added Entry',
      subfields: [{ code: 'a', val: formData.subjects?.[0]?.name || 'Islam -- Studi dan Pengajaran' }],
    },
    ...(formData.eResourceUrl
      ? [
          {
            tag: '856',
            ind: '40',
            label: 'Electronic Location',
            subfields: [{ code: 'u', val: formData.eResourceUrl }, { code: 'z', val: 'Akses koleksi daring' }],
          },
        ]
      : []),
  ]

  const rawMarcText = marcFields
    .map((item) => {
      if (item.subfields) {
        const sfStr = item.subfields.map((sf) => `$${sf.code} ${sf.val}`).join(' ')
        return `=${item.tag}  ${item.ind} ${sfStr}`
      }
      return `=${item.tag}  ${item.ind} ${item.value}`
    })
    .join('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMarcText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Representasi MARC 21 Bibliografi
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  RDA Compliant
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Struktur data katalog bibliografis standar perpustakaan internasional (ISO 2709 / MARCXML).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Tampilan Kolom (Tabel)
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'raw'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Tampilan Raw Breaker (=TAG)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin MARC</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'table' ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center font-mono">Tag</th>
                    <th className="py-2.5 px-2 w-12 text-center font-mono">Ind</th>
                    <th className="py-2.5 px-4 w-48">Deskripsi Bidang</th>
                    <th className="py-2.5 px-4 font-mono">Isi Data &amp; Subfield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {marcFields.map((field, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                    >
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                        {field.tag}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                        {field.ind.replace(/ /g, '#')}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {field.label}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">
                        {field.subfields ? (
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {field.subfields.map((sf, sIdx) => (
                              <span key={sIdx} className="inline-flex items-center gap-1">
                                <span className="font-mono font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded text-[10px]">
                                  ${sf.code}
                                </span>
                                <span className="font-mono text-slate-800">{sf.val}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-mono text-slate-700">{field.value}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
              <pre>{rawMarcText}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Form ini disinkronkan secara real-time dengan isian entri katalog.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  )
}
