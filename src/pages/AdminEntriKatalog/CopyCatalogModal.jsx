import { useState } from 'react'
import { X, Search, BookCopy, Check, ArrowRight } from 'lucide-react'

export default function CopyCatalogModal({ isOpen, onClose, onSelectCatalog }) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

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
        'Buku ini menyajikan telaah mendalam mengenai kerangka epistemologis studi Islam kontemporer yang relevan bagi santri dan akademisi madrasah. Dilengkapi dengan pedoman riset digital, studi naskah keagamaan, serta integrasi sains modern dengan khazanah turats pesantren.',
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
    {
      id: 3,
      title: 'Katalogisasi Bahan Monograf Berbasis RDA',
      subtitle: 'Pedoman Standar Perpustakaan Nasional RI',
      statementOfResponsibility: 'Tim Penyusun Perpusnas RI',
      mainAuthor: 'Perpustakaan Nasional RI',
      publisher: 'Perpusnas Press',
      publishCity: 'Jakarta',
      publishYear: '2024',
      edition: 'Cetakan 3',
      pages: 'xvi, 185 hlm.',
      dimension: '25 cm',
      isbn: '978-979-008-887-2',
      ddcNumber: '025.3',
      callNumber: '025.3 TIM k',
      subject: 'Katalogisasi -- Standar RDA',
      notes: 'Buku panduan resmi katalogisasi berbasis Resource Description and Access.',
    },
  ]

  const filtered = sampleCatalogs.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.isbn.includes(searchTerm) ||
      c.mainAuthor.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                Pilih katalog rujukan untuk menduplikasi metadata bibliografis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
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
              placeholder="Cari berdasarkan judul, ISBN, atau nama pengarang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Katalog tidak ditemukan untuk pencarian "{searchTerm}"
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                      {item.title}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                      ISBN: {item.isbn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{item.subtitle}</p>
                  <p className="text-[11px] text-slate-500">
                    Pengarang: <span className="font-medium text-slate-700">{item.mainAuthor}</span> • Penerbit:{' '}
                    <span className="font-medium text-slate-700">{item.publisher} ({item.publishYear})</span>
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(item)}
                  className="px-3.5 py-2 bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <span>Gunakan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
