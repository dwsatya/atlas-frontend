import { useState, useEffect } from 'react'
import { X, Search, BookCopy, ArrowRight, Loader2 } from 'lucide-react'
import { fetchAdminCatalogs, fetchBooks } from '../../services/api'

export default function CopyCatalogModal({ isOpen, onClose, onSelectCatalog }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [catalogs, setCatalogs] = useState([])
  const [loading, setLoading] = useState(false)

  const sampleCatalogs = [
    {
      id: 1,
      title: 'Epistemologi Studi Islam Kontemporer',
      subtitle: 'Integrasi Sains dan Turats dalam Pendidikan Modern',
      statementOfResponsibility: 'Ridwan Surasta, M.A. ; Editor: Prof. Dr. I Nyoman Suweta',
      mainAuthor: 'Surasta, Ridwan',
      publisher: 'Erlangga',
      publishCity: 'Singaraja',
      publishYear: '2026',
      edition: 'Cetakan ke-2 (Revisi Lengkap)',
      pages: 'xxiv, 312 hlm.',
      dimension: '24 cm',
      isbn: '978-623-789-812-4',
      ddcNumber: '297.01',
      callNumber: '297.01 SUR e',
      subject: 'Islam -- Studi dan Pengajaran',
      notes:
        'Buku ini menyajikan telaah mendalam mengenai kerangka epistemologis studi Islam kontemporer yang relevan bagi santri dan akademisi madrasah.',
    },
    {
      id: 2,
      title: 'Sejarah Kearsipan & Kerajaan Buleleng Tempo Doeloe',
      subtitle: 'Kajian Filologi & Manuskrip Lontar Gedong Kirtya',
      statementOfResponsibility: 'Drs. I Ketut Suardana, M.Si.',
      mainAuthor: 'Suardana, I Ketut',
      publisher: 'Pustaka Bali Post',
      publishCity: 'Singaraja',
      publishYear: '2025',
      edition: 'Edisi Pertama',
      pages: 'xviii, 240 hlm.',
      dimension: '21 cm',
      isbn: '978-602-456-789-1',
      ddcNumber: '959.86',
      callNumber: '959.86 SUA s',
      subject: 'Buleleng -- Sejarah',
      notes:
        'Kajian mendalam mengenai dokumen manuskrip lontar dan sejarah tata kelola pemerintahan kerajaan di Singaraja Buleleng.',
    },
  ]

  useEffect(() => {
    if (!isOpen) return

    const loadCatalogs = async () => {
      setLoading(true)
      try {
        let res
        try {
          res = await fetchAdminCatalogs({ search: searchTerm, per_page: 20 })
        } catch {
          res = await fetchBooks({ search: searchTerm })
        }

        const rawList = res?.data?.data || res?.data || []
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || '',
            statementOfResponsibility: item.statement_of_responsibility || '',
            mainAuthor: item.author_main || '',
            publisher: item.publisher || '',
            publishCity: item.publish_city || '',
            publishYear: item.publish_year || '',
            edition: item.edition || '',
            pages: item.pages || '',
            dimension: item.dimension || '',
            isbn: item.isbn || '',
            ddcNumber: item.ddc_number || '-',
            callNumber: item.catalog_call_number || '-',
            subject: item.subject_topic || '',
            notes: item.abstract || '',
            materialType: item.material_type || '',
            language: item.language || '',
          }))
          setCatalogs(mapped)
        } else {
          setCatalogs(
            sampleCatalogs.filter(
              (c) =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.isbn.includes(searchTerm) ||
                c.mainAuthor.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        }
      } catch (err) {
        console.warn('Gagal memuat katalog untuk salin data:', err)
        setCatalogs(sampleCatalogs)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadCatalogs, 300)
    return () => clearTimeout(timer)
  }, [isOpen, searchTerm])

  if (!isOpen) return null

  const handleSelect = (catalog) => {
    onSelectCatalog(catalog)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B2559] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <BookCopy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Salin Dari Katalog Lain</h3>
              <p className="text-xs text-blue-200">
                Pilih katalog rujukan untuk menduplikasi metadata bibliografis dari database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, ISBN, atau nama pengarang di database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Memuat data katalog dari database...</span>
            </div>
          ) : catalogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Katalog tidak ditemukan untuk pencarian &quot;{searchTerm}&quot;
            </div>
          ) : (
            catalogs.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-[#0B2559] group-hover:text-blue-700 transition">
                      {item.title}
                    </span>
                    {item.callNumber && item.callNumber !== '-' && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                        {item.callNumber}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span>Pengarang: <strong className="text-slate-700">{item.mainAuthor || '-'}</strong></span>
                    <span>•</span>
                    <span>Penerbit: <strong className="text-slate-700">{item.publisher || '-'} ({item.publishYear || '-'})</strong></span>
                    <span>•</span>
                    <span>ISBN: <strong className="font-mono text-slate-700">{item.isbn || '-'}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(item)}
                  className="px-3.5 py-1.5 bg-[#0B2559] hover:bg-[#07183d] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs group-hover:shadow"
                >
                  <span>Salin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {catalogs.length} katalog</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
