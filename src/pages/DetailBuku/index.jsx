import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import logoatlas from '../../assets/logoatlas.png'
import { fetchBookById } from '../../services/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'


export default function DetailBuku() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [copiedFormat, setCopiedFormat] = useState(null)

  const loadBookDetail = useCallback(async (bookId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchBookById(bookId)
      if (res?.data) {
        setBook(res.data)
      } else {
        setError('Data buku tidak ditemukan.')
      }
    } catch (err) {
      console.error('Failed to load book detail:', err)
      setError('Gagal memuat detail buku. Pastikan server backend berjalan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      loadBookDetail(id)
    }
  }, [id, loadBookDetail])

  // Handle Quick Search
  const handleQuickSearchSubmit = (e) => {
    e.preventDefault()
    if (quickSearch.trim()) {
      navigate(`/opac?search=${encodeURIComponent(quickSearch.trim())}`)
    }
  }

  // Handle Citation Export
  const handleExportCitation = (type) => {
    if (!book) return

    let content = ''
    let filename = `sitasi-${book.id}`

    if (type === 'bibtex') {
      filename += '.bib'
      content = `@book{buku_${book.id},
  title = {${book.title || ''}},
  author = {${book.author_main || 'Anonim'}},
  publisher = {${book.publisher || ''}},
  year = {${book.publish_year || ''}},
  isbn = {${book.isbn || ''}},
  address = {${book.publish_city || 'Singaraja'}}
}`
    } else if (type === 'ris') {
      filename += '.ris'
      content = `TY  - BOOK
TI  - ${book.title || ''}
AU  - ${book.author_main || 'Anonim'}
PB  - ${book.publisher || ''}
PY  - ${book.publish_year || ''}
SN  - ${book.isbn || ''}
CY  - ${book.publish_city || 'Singaraja'}
ER  - `
    } else if (type === 'csv') {
      filename += '.csv'
      content = `Judul,Pengarang,Penerbit,Tahun,ISBN,Kota
"${book.title || ''}","${book.author_main || ''}","${book.publisher || ''}","${book.publish_year || ''}","${book.isbn || ''}","${book.publish_city || ''}"`
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setCopiedFormat(type)
    setTimeout(() => setCopiedFormat(null), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* 1. Header / Navbar Terpadu */}
      <Navbar />


      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-5">
        {/* Top Breadcrumb & ID Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>&larr;</span>
            <span>Kembali ke Hasil Pencarian</span>
          </button>

          {book && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-200/80 text-slate-700 font-semibold text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>OPAC ID: #{String(book.id).padStart(4, '0')}</span>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 animate-pulse flex flex-col md:flex-row gap-6">
                <div className="w-52 h-72 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="h-16 bg-slate-200 rounded-xl" />
                    <div className="h-16 bg-slate-200 rounded-xl" />
                    <div className="h-16 bg-slate-200 rounded-xl" />
                    <div className="h-16 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 h-48 animate-pulse" />
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 h-64 animate-pulse" />
            </div>
          </div>
        ) : error || !book ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-4 my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {error || 'Data Buku Tidak Ditemukan'}
            </h2>
            <p className="text-xs text-slate-500">
              Buku yang Anda cari mungkin telah dihapus atau ID buku tidak valid.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate('/opac')}
                className="px-5 py-2.5 bg-[#002B66] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#001D48] transition-all"
              >
                Kembali ke Katalog OPAC
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ================= LEFT MAIN CONTENT (8 Columns) ================= */}
            <div className="lg:col-span-8 space-y-6">
              {/* Top Hero Book Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-7 items-start">
                {/* Book Cover Container */}
                <div className="flex flex-col items-center shrink-0 w-full md:w-52">
                  <div className="w-full h-72 rounded-2xl bg-gradient-to-br from-[#001D48] via-[#002B66] to-[#041c3d] text-white p-5 flex flex-col justify-between text-center shadow-xl border border-indigo-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Book Cover Header Icon */}
                    <div className="flex justify-center pt-2">
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    </div>

                    {/* Title & Author on Cover */}
                    <div className="space-y-1.5 py-4">
                      <h3 className="font-extrabold text-base sm:text-lg leading-snug line-clamp-3 text-white tracking-wide">
                        {book.title}
                      </h3>
                      <p className="text-xs text-indigo-200 line-clamp-2 font-medium">
                        {book.author_main || book.author || 'Dinas Perpustakaan'}
                      </p>
                    </div>

                    {/* Bottom Publisher & Year */}
                    <div className="text-[11px] text-slate-300/90 pt-3 border-t border-white/10 flex items-center justify-between font-medium">
                      <span className="truncate max-w-[100px]">{book.publisher || 'Buleleng Lib'}</span>
                      <span>{book.publish_year || '-'}</span>
                    </div>
                  </div>

                  {/* Zoom Modal Button */}
                  <button
                    type="button"
                    onClick={() => setShowCoverModal(true)}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Perbesar Sampul Fisik</span>
                  </button>
                </div>

                {/* Book Main Details */}
                <div className="flex-1 space-y-4 w-full">
                  {/* Category & Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-md">
                      {book.material_type || 'Buku Teks / Bacaan'}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-md">
                      {book.media_type || 'Buku Teks / Cetak'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Bahan Pustaka Terakreditasi</span>
                    </span>
                  </div>

                  {/* Book Title */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032360] tracking-tight leading-snug">
                      Buku {book.title}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Penulis Utama:{' '}
                      <span
                        onClick={() =>
                          navigate(`/opac?search=${encodeURIComponent(book.author_main || '')}`)
                        }
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        {book.author_main || 'Penulis Tidak Diketahui'}
                      </span>
                    </p>
                  </div>

                  {/* 2x2 Grid Metadata Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <span className="block text-[11px] font-semibold text-slate-400">Pengarang</span>
                      <span className="block text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {book.author_main || '-'}
                        {book.author_additional_person ? `, ${book.author_additional_person}` : ''}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <span className="block text-[11px] font-semibold text-slate-400">Penerbit & Kota</span>
                      <span className="block text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {book.publisher || '-'}{book.publish_city ? `, ${book.publish_city}` : ', Singaraja'}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <span className="block text-[11px] font-semibold text-slate-400">Tahun Publikasi</span>
                      <span className="block text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {book.publish_year || '-'} (Cetakan {book.edition || 'Ke-1'})
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <span className="block text-[11px] font-semibold text-slate-400">Bahasa Dokumen</span>
                      <span className="block text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {book.language || 'Bahasa Indonesia (ind)'}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 sm:col-span-2">
                      <span className="block text-[11px] font-semibold text-slate-400">Status Akses</span>
                      <span className="block text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
                        {(book.available_copies ?? 1) > 0
                          ? 'Dapat Dipinjam (Reguler)'
                          : 'Hanya Baca di Tempat (Stok Fisik Sedang Dipinjam)'}
                      </span>
                    </div>
                  </div>

                  {/* Subjek Terkait Badges */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-semibold text-[11px]">Subjek Terkait:</span>
                    {book.subject_topic ? (
                      book.subject_topic.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={() => navigate(`/opac?search=${encodeURIComponent(tag.trim())}`)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          #{tag.trim()}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
                          #Koleksi Umum
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
                          #Buku Bacaan
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
                          #Perpustakaan Daerah
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer active:scale-95 ${
                        isFavorite
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'}`}
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      <span>{isFavorite ? 'Tersimpan di Favorit' : 'Favorit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Pengajuan reservasi untuk buku "${book.title}" sedang diproses. Silakan tunjukkan kartu anggota di meja sirkulasi.`)}
                      className="px-6 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H7.5m9 0a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25H7.5a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25" />
                      </svg>
                      <span>Reservasi Buku Ini</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spesifikasi Detail Teknis & Katalogisasi Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#032360]">
                      Spesifikasi Detail Teknis & Katalogisasi
                    </h2>
                    <p className="text-xs text-slate-400">
                      Metadata standar Perpustakaan Nasional RI (MARC21 / RDA)
                    </p>
                  </div>
                </div>

                {/* 4 Technical Metadata Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        DESKRIPSI FISIK KOLEKSI
                      </span>
                      <span className="block text-xs font-bold text-slate-900">
                        {book.pages || '120'} hlm. ; {book.dimension || '25 cm.'}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {book.statement_of_responsibility || 'Termasuk glosarium & lampiran teks sastra'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ISBN (STANDAR BUKU INTERNASIONAL)
                      </span>
                      <span className="block text-xs font-bold text-slate-900">
                        {book.isbn || '978-222-666-444'}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Jilid Lengkap / Edisi Cetak Perdana
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        NOMOR KONTROL SISTEM (CONTROL NUMBER)
                      </span>
                      <span className="block text-xs font-bold text-slate-900 font-mono">
                        ATL{String(book.id).padStart(12, '0')}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        ID Unik Database Perpustakaan Buleleng
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        BIB ID MASTER / NO. KLASIFIKASI DDC
                      </span>
                      <span className="block text-xs font-bold text-slate-900 font-mono">
                        {book.ddc_number || book.catalog_call_number || '0010-0922012469'}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Tersinkronisasi KTI Nasional
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validasi Pengindeksan Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 font-semibold text-[11px]">Validasi Pengindeksan:</span>
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                      <span>✓</span> Bibliografi Nasional Indonesia
                    </span>
                    <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                      <span>☆</span> Karya Tulis Ilmiah & Sastra Santri
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Diunggah: {book.created_at ? new Date(book.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '07 Sep 2026'}
                  </span>
                </div>

                {/* Ekspor Sitasi & Data Referensi */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs font-extrabold text-[#032360]">
                    Ekspor Sitasi & Data Referensi
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportCitation('bibtex')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>BibTeX (.bib)</span>
                      {copiedFormat === 'bibtex' && <span className="text-emerald-600">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportCitation('ris')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>RIS (Zotero)</span>
                      {copiedFormat === 'ris' && <span className="text-emerald-600">✓</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportCitation('csv')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>CSV File</span>
                      {copiedFormat === 'csv' && <span className="text-emerald-600">✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT SIDEBAR (4 Columns) ================= */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Pencarian Cepat */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-3.5">
                <div className="flex items-center space-x-2 text-[#032360] font-bold text-sm">
                  <span className="text-indigo-600 text-base">⚡</span>
                  <span>Pencarian Cepat</span>
                </div>

                <form onSubmit={handleQuickSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    placeholder="Ketik kata kunci, judul, penulis..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B66]"
                  />
                  <svg
                    className="w-4 h-4 text-slate-400 absolute left-3 top-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </form>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/opac')}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-[#002B66] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Jelajah Katalog Lengkap</span>
                    </div>
                    <span>&rsaquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/opac')}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>Jelajah Berdasarkan Subjek</span>
                    </div>
                    <span>&rsaquo;</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Data Eksemplar */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-[#032360] font-bold text-sm">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Data Eksemplar</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {book.available_copies ?? 1}/{book.total_copies ?? 1} Ada
                  </span>
                </div>

                {/* List Collections / Eksemplar */}
                {book.collections && book.collections.length > 0 ? (
                  <div className="space-y-3">
                    {book.collections.map((coll, idx) => (
                      <div
                        key={coll.id || idx}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#002B66]">
                            BARCODE : {coll.barcode_no || `B-${String(book.id * 100 + idx + 1).padStart(5, '0')}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              coll.availability_status === 'AVAILABLE' || !coll.availability_status
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {coll.availability_status === 'AVAILABLE' || !coll.availability_status
                              ? 'Tersedia'
                              : 'Dipinjam'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-400">No. Induk:</span>{' '}
                            <span className="font-semibold text-slate-800">
                              {coll.item_number || `ATL-${book.publish_year || '2024'}/${String(coll.id || idx + 1).padStart(4, '0')}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Pola:</span>{' '}
                            <span className="font-semibold text-slate-800">
                              {coll.category || 'Sirkulasi Santri'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Ruang:</span>{' '}
                            <span className="font-semibold text-slate-800">
                              {coll.room_location_code || 'Lt. 1 Ruang Baca'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Durasi:</span>{' '}
                            <span className="font-semibold text-slate-800">Maks. 7 Hari</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#002B66]">
                        BARCODE : B-{String(book.id * 100 + 491).padStart(5, '0')}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Tersedia
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400">No. Induk:</span>{' '}
                        <span className="font-semibold text-slate-800">
                          ATL-{book.publish_year || '2024'}/0912
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Pola:</span>{' '}
                        <span className="font-semibold text-slate-800">Sirkulasi Santri</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Ruang:</span>{' '}
                        <span className="font-semibold text-slate-800">Lt. 1 Ruang Baca</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Durasi:</span>{' '}
                        <span className="font-semibold text-slate-800">Maks. 7 Hari</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
                  <span className="text-indigo-600">ℹ</span>
                  <p>Bawa kartu KTA aktif ke meja sirkulasi untuk meminjam buku</p>
                </div>
              </div>

              {/* Card 3: Pencarian Terkait */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-[#032360] font-bold text-sm border-b border-slate-100 pb-3">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Pencarian Terkait</span>
                </div>

                <div className="space-y-2">
                  {book.author_main && (
                    <div
                      onClick={() => navigate(`/opac?search=${encodeURIComponent(book.author_main)}`)}
                      className="group p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            Karya {book.author_main}
                          </h4>
                          <p className="text-[10px] text-slate-400">Lihat judul lain dari penulis ini</p>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600 transition-colors">&rsaquo;</span>
                    </div>
                  )}

                  {book.publisher && (
                    <div
                      onClick={() => navigate(`/opac?search=${encodeURIComponent(book.publisher)}`)}
                      className="group p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            Koleksi Penerbit {book.publisher}
                          </h4>
                          <p className="text-[10px] text-slate-400">Lihat terbitan dari penerbit ini</p>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600 transition-colors">&rsaquo;</span>
                    </div>
                  )}

                  <div
                    onClick={() => navigate(`/opac?search=${encodeURIComponent(book.title.split(' ')[0] || '')}`)}
                    className="group p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Subjek: {book.material_type || 'Buku Referensi'}
                        </h4>
                        <p className="text-[10px] text-slate-400">Lihat koleksi tema terkait</p>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-600 transition-colors">&rsaquo;</span>
                  </div>

                  {book.publish_year && (
                    <div
                      onClick={() => navigate(`/opac?search=${encodeURIComponent(book.publish_year)}`)}
                      className="group p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            Terbitan Tahun {book.publish_year}
                          </h4>
                          <p className="text-[10px] text-slate-400">Lihat koleksi seangkatan</p>
                        </div>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600 transition-colors">&rsaquo;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Butuh Bantuan Sirkulasi? */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#002B66] text-white flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a2.25 2.25 0 002.25-2.25H9.75A2.25 2.25 0 0012 18.75zM2.25 12.75V12A8.25 8.25 0 0112 3.75 8.25 8.25 0 0121.75 12v.75a3 3 0 01-3 3h-.75a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 011.5-1.5h1.5A6.75 6.75 0 0012 5.25 6.75 6.75 0 005.25 12h1.5A1.5 1.5 0 018.25 13.5v3A1.5 1.5 0 016.75 18h-.75a3 3 0 01-3-3v-.75z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#032360]">
                      Butuh Bantuan Sirkulasi?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Petugas Pustakawan jaga hari ini siap membantu pencarian fisik atau perpanjangan buku.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pustakawan Jaga:</span>
                    <span className="font-bold text-slate-800">Ridwan Surasta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">WhatsApp:</span>
                    <a
                      href="https://wa.me/6281529857862"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      +62 815-2985-7862
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Cover Zoom Modal */}
      {showCoverModal && book && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCoverModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCoverModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-[#001D48] to-[#032360] text-white p-6 flex flex-col justify-between text-center shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">{book.title}</h3>
                <p className="text-sm text-indigo-200">{book.author_main || 'Penulis Perpustakaan'}</p>
              </div>

              <div className="text-xs text-slate-300 pt-3 border-t border-white/10 flex justify-between">
                <span>{book.publisher || 'Buleleng Library'}</span>
                <span>{book.publish_year || '-'}</span>
              </div>
            </div>

            <div className="text-left space-y-1">
              <h4 className="font-bold text-sm text-slate-900">{book.title}</h4>
              <p className="text-xs text-slate-500">
                ISBN: {book.isbn || '-'} | Penerbit: {book.publisher || '-'} ({book.publish_year || '-'})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer Section Terpadu */}
      <Footer />
    </div>
  )
}
