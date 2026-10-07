import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import background2 from '../../assets/background2.jpeg'
import logoatlas from '../../assets/logoatlas.png'
import { fetchBooks } from '../../services/api'

export default function OpacPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialSearch = searchParams.get('search') || ''
  const [searchCategory, setSearchCategory] = useState('Judul Buku')
  const [searchKeyword, setSearchKeyword] = useState(initialSearch)
  const [filterPengarang, setFilterPengarang] = useState('')
  const [filterPenerbit, setFilterPenerbit] = useState('')
  const [filterSubjek, setFilterSubjek] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterBahan, setFilterBahan] = useState('Semua Jenis Bahan')
  const [currentPage, setCurrentPage] = useState(1)

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)

  const popularSearches = [
    'Bahasa Indonesia',
    'Pendidikan Agama Islam',
    'Matematika Kelas VII',
    'Ilmu Pengetahuan Alam',
    'Cerita Rakyat',
  ]

  const loadBooks = useCallback(async (keyword = '', page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchBooks({ search: keyword, page })
      const bookList = res?.data?.data || res?.data || []
      setBooks(bookList)
      if (res?.data?.meta) {
        setMeta(res.data.meta)
      }
    } catch (err) {
      console.error('Failed to load books in OPAC:', err)
      setError('Gagal memuat katalog buku.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get('search') || ''
    setSearchKeyword(q)
    loadBooks(q, currentPage)
  }, [searchParams, currentPage, loadBooks])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setCurrentPage(1)
    setSearchParams(searchKeyword.trim() ? { search: searchKeyword.trim() } : {})
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* 1. Header / Navbar */}
      <header className="bg-[#00255c] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Top-Left Logo Container */}
          <div
            className="bg-white rounded-2xl px-4 py-2 flex items-center shadow-md cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img
              src={logoatlas}
              alt="ATLAS Logo"
              className="h-9 sm:h-10 object-contain"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={() => navigate('/opac')}
              className="text-white font-bold pb-1 border-b-2 border-white cursor-pointer"
            >
              OPAC / Katalog
            </button>
            <div className="relative group cursor-pointer hidden sm:flex items-center gap-1 text-white/80 hover:text-white transition-colors">
              <span>Layanan Mandiri</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Login Pill Button */}
            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-slate-100 text-[#002B66] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span>Login</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Hero Search Banner Section */}
      <section className="max-w-6xl mx-auto px-4 pt-6 sm:pt-8 w-full">
        <div
          className="relative rounded-3xl overflow-hidden bg-cover bg-center shadow-lg border border-slate-200/60"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 37, 92, 0.90), rgba(0, 20, 55, 0.95)), url(${background2})`,
          }}
        >
          <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center">
            {/* Badge pill */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 shadow-sm">
              APLIKASI TERPADU LAYANAN ARSIP & SIRKULASI
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
              Katalog Perpustakaan Online (OPAC)
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl font-normal leading-relaxed">
              Temukan referensi, buku ajar, modul santri, dan koleksi literatur dengan mudah dan cepat.
            </p>

            {/* Search Box Container */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-4xl bg-white rounded-2xl p-4 sm:p-5 shadow-2xl mt-6 text-slate-800 space-y-3 text-left">
              {/* Top Row: Dropdown, Search Input, Search Button */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative shrink-0 sm:w-44">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full h-11 px-3.5 pr-8 bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs sm:text-sm font-bold rounded-xl appearance-none border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002B66] cursor-pointer transition-colors"
                  >
                    <option>Judul Buku</option>
                    <option>Pengarang</option>
                    <option>Penerbit</option>
                    <option>Subjek</option>
                    <option>ISBN</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Masukkan kata kunci pencarian judul, pengarang, topik..."
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002B66] focus:border-[#002B66] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 px-6 bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span>Cari Katalog</span>
                </button>
              </div>

              {/* Bottom Row: Additional Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 border-t border-slate-100">
                <input
                  type="text"
                  value={filterPengarang}
                  onChange={(e) => setFilterPengarang(e.target.value)}
                  placeholder="Filter Pengarang..."
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B66]"
                />
                <input
                  type="text"
                  value={filterPenerbit}
                  onChange={(e) => setFilterPenerbit(e.target.value)}
                  placeholder="Filter Penerbit..."
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B66]"
                />
                <input
                  type="text"
                  value={filterSubjek}
                  onChange={(e) => setFilterSubjek(e.target.value)}
                  placeholder="Filter Subjek..."
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B66]"
                />
                <input
                  type="text"
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  placeholder="Filter Tahun (cth. 2023)"
                  className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B66]"
                />
                <div className="relative col-span-2 sm:col-span-1">
                  <select
                    value={filterBahan}
                    onChange={(e) => setFilterBahan(e.target.value)}
                    className="w-full h-9 px-3 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#002B66] cursor-pointer"
                  >
                    <option>Semua Jenis Bahan</option>
                    <option>Buku Cetak</option>
                    <option>Digital / E-Book</option>
                    <option>Majalah / Jurnal</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-white/90">
              <span className="font-semibold text-white/70">Pencarian Populer:</span>
              {popularSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchKeyword(item)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Two-Column Layout */}
      <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR (4 columns) - Identical sizing & style to Landing Page */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Card 1: Statistik Koleksi */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-[#032360] font-bold text-base border-b border-slate-100 pb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Statistik Koleksi</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  <span className="block text-[11px] font-semibold text-slate-500">Koleksi Buku</span>
                  <span className="block text-xl font-extrabold text-[#032360] mt-1">3.482</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  <span className="block text-[11px] font-semibold text-slate-500">Buku Dipinjam</span>
                  <span className="block text-xl font-extrabold text-emerald-600 mt-1">8.910</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  <span className="block text-[11px] font-semibold text-slate-500">Anggota Aktif</span>
                  <span className="block text-xl font-extrabold text-[#032360] mt-1">624</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  <span className="block text-[11px] font-semibold text-slate-500">Sirkulasi Hari Ini</span>
                  <span className="block text-xl font-extrabold text-emerald-600 mt-1">47</span>
                </div>
              </div>
            </div>

            {/* Card 2: Butuh Bantuan Pustakawan */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#002B66] text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A8.25 8.25 0 0112 3.75 8.25 8.25 0 0121.75 12v.75a3 3 0 01-3 3h-.75a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 011.5-1.5h1.5A6.75 6.75 0 0012 5.25 6.75 6.75 0 005.25 12h1.5A1.5 1.5 0 018.25 13.5v3A1.5 1.5 0 016.75 18h-.75a3 3 0 01-3-3v-.75zM12 18.75a2.25 2.25 0 002.25-2.25H9.75A2.25 2.25 0 0012 18.75z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#032360] leading-snug">
                    Butuh Bantuan Pustakawan?
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Layanan konsultasi referensi & peminjaman.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/6285753341689"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 hover:bg-slate-50 text-[#032360] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
              >
                <span>Hubungi Pustakawan</span>
              </a>
            </div>

            {/* Card 3: Layanan Mandiri */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-[#032360] font-bold text-base border-b border-slate-100 pb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Layanan Mandiri</span>
              </div>

              <div className="space-y-2">
                <a
                  href="#baca-ditempat"
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span>Baca Ditempat</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>

                <a
                  href="#cek-pengembalian"
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </div>
                    <span>Cek Pengembalian</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>

                <a
                  href="#usulan-buku"
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </div>
                    <span>Usulan Pengadaan Buku</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT (8 columns) */}
          <section className="lg:col-span-8 space-y-6">
            {/* Header: Koleksi Terbaru */}
            <div>
              <h2 className="text-2xl font-extrabold text-[#032360] tracking-tight">
                Koleksi Terbaru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Buku-buku yang baru saja ditambahkan.
              </p>
            </div>

            {/* 10 Book Cards Grid (2 Columns) */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex gap-3.5 items-stretch animate-pulse"
                  >
                    <div className="w-28 sm:w-32 h-48 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-5 bg-slate-200 rounded w-4/5" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                      <div className="h-8 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
                <p className="text-rose-700 text-sm font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => loadBooks(searchKeyword, currentPage)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Coba Lagi
                </button>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">Tidak ada buku yang sesuai dengan pencarian.</p>
                <p className="text-xs text-slate-500">Coba gunakan kata kunci lain atau bersihkan filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                  <div
                    key={book.id || book.title}
                    className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex gap-3.5 items-stretch justify-between group"
                  >
                    {/* Left: Book Cover Placeholder */}
                    <div className="w-28 sm:w-32 h-48 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-slate-400 font-medium text-xs leading-snug shrink-0 group-hover:from-indigo-50 group-hover:to-slate-100 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-[#002B66] mb-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="line-clamp-2 text-[10px] font-semibold text-slate-600">
                        {book.title}
                      </span>
                    </div>

                    {/* Right: Book Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                      <div className="space-y-2">
                        {/* Badge Category & Status */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="bg-blue-100 text-[#002B66] text-[10px] font-bold px-2 py-0.5 rounded-md truncate">
                            {book.material_type || 'Buku Cetak'}
                          </span>
                          <div
                            className={`flex items-center space-x-1 text-[11px] font-bold ${
                              (book.available_copies ?? 1) > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                (book.available_copies ?? 1) > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>
                              {(book.available_copies ?? 1) > 0
                                ? `${book.available_copies ?? 1} Tersedia`
                                : 'Stok Habis'}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors" title={book.title}>
                          {book.title}
                        </h3>

                        {/* Metadata Details */}
                        <div className="space-y-1 pt-0.5 text-[11px] text-slate-500">
                          <div className="flex items-center space-x-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <span className="truncate">{book.author_main || book.author || 'Penulis Tidak Diketahui'}</span>
                          </div>
                          {book.publisher && (
                            <div className="flex items-center space-x-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A48.357 48.357 0 0012 9.75c-2.551 0-5.056.2-7.5.583V21" />
                              </svg>
                              <span className="truncate">{book.publisher}</span>
                            </div>
                          )}
                          {book.publish_year && (
                            <div className="flex items-center space-x-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              <span>{book.publish_year}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Button Lihat Detail */}
                      <button
                        type="button"
                        onClick={() => navigate(`/books/${book.id}`)}
                        className="mt-3.5 w-full py-1.5 rounded-full border border-indigo-500/40 text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition-all cursor-pointer text-center active:scale-95"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center space-x-1.5 pt-6 pb-2 text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lsaquo; Sebelumnya
                </button>

                {Array.from({ length: meta.last_page }).map((_, index) => {
                  const pageNum = index + 1
                  if (
                    pageNum === 1 ||
                    pageNum === meta.last_page ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#002B66] text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="px-1 text-slate-400 font-bold">
                        ...
                      </span>
                    )
                  }
                  return null
                })}

                <button
                  type="button"
                  disabled={currentPage >= meta.last_page}
                  onClick={() => setCurrentPage((prev) => Math.min(meta.last_page, prev + 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya &rsaquo;
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 4. Footer Section */}
      <footer className="bg-[#001D48] text-white pt-12 pb-6 border-t border-[#001738]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-800 text-xs leading-relaxed">
          {/* Column 1: Info Dinas */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white tracking-wider uppercase">
              Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng
            </h3>
            <p className="text-slate-300">
              ATLAS hadir sebagai solusi digital terintegrasi dari Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng. Memberikan kemudahan layanan pengelolaan arsip dan sirkulasi perpustakaan yang modern dan mudah diakses kapan saja oleh masyarakat Buleleng.
            </p>
          </div>

          {/* Column 2: Waktu Layanan */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white tracking-wider uppercase">
              Waktu Layanan
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              <li>
                <span className="font-bold text-white">Senin - Kamis:</span> 07.30 – 16.00 WITA
              </li>
              <li>
                <span className="font-bold text-white">Jumat:</span> 07.30 – 14.00 WITA
              </li>
              <li className="text-rose-400 font-bold">
                Hari Libur: Tutup
              </li>
            </ul>
          </div>

          {/* Column 3: Kontak & Alamat */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white tracking-wider uppercase">
              Kontak & Alamat
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center space-x-2">
                <span>📍</span>
                <span>Jl. Wrekudara No.1 Singaraja</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>✉️</span>
                <span>dap@bulelengkab.go.id</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>(0362) 24754</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© 2026 Dinas Komunikasi, Informatika, Persandian, dan Statistik Kabupaten Buleleng</p>
          <div className="flex items-center space-x-4">
            <a href="#kebijakan" className="hover:text-white transition-colors">Kebijakan Sirkulasi</a>
            <span>|</span>
            <a href="#etika" className="hover:text-white transition-colors">Etika Perpustakaan</a>
            <span>|</span>
            <a href="#bantuan" className="hover:text-white transition-colors">Bantuan OPAC</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
