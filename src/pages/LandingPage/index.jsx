import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import background2 from '../../assets/background2.jpeg'
import logoatlas from '../../assets/logoatlas.png'
import logo from '../../assets/Logo.png'
import { fetchBooks } from '../../services/api'
import { notifyLoginSuccess } from '../../utils/notification'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { LayananMandiriCard } from '../../components/LayananMandiri'
import BookCover from '../../components/BookCover'

export default function LandingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated, login } = useAuth()
  const hasHandledOAuth = useRef(false)

  // Tangani callback login Google jika diarahkan ke landing page
  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const userParam = searchParams.get('user')

    if (tokenParam && userParam && !hasHandledOAuth.current) {
      hasHandledOAuth.current = true
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam))
        login(parsedUser, tokenParam)
        notifyLoginSuccess(parsedUser.name || parsedUser.nama_lengkap || parsedUser.email, false)
        // Bersihkan token & data user dari URL di browser address bar
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (err) {
        console.error('Failed to parse Google user parameter on landing page:', err)
      }
    }
  }, [searchParams, login])

  const [searchKeyword, setSearchKeyword] = useState('')
  const [category, setCategory] = useState('Judul Buku')
  const [filterPengarang, setFilterPengarang] = useState('')
  const [filterPenerbit, setFilterPenerbit] = useState('')
  const [filterSubjek, setFilterSubjek] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterBahan, setFilterBahan] = useState('Semua Jenis Bahan')

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(null)

  const loadBooks = useCallback(async (keyword = '') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchBooks({ search: keyword, page: 1 })
      const bookList = res?.data?.data || res?.data || []
      setBooks(bookList.slice(0, 8)) // Ambil 8 buku terbaru untuk Landing Page
      if (res?.data?.meta?.total !== undefined) {
        setTotalCount(res.data.meta.total)
      } else if (Array.isArray(bookList)) {
        setTotalCount(bookList.length)
      }
    } catch (err) {
      console.error('Failed to load books:', err)
      setError('Gagal memuat data buku dari server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleSearch = (e) => {
    e?.preventDefault()
    if (searchKeyword.trim()) {
      navigate(`/opac?search=${encodeURIComponent(searchKeyword.trim())}`)
    } else {
      loadBooks()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header / Navbar Terpadu */}
      <Navbar />


      {/* 2. Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white pt-16 pb-28 sm:pt-20 sm:pb-36 px-4"
        style={{
          backgroundImage: `url(${background2}), url('/background2.jpeg')`,
        }}
      >
        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-[#001D48]/60 backdrop-blur-[1px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Logo Emblem */}
          <div className="flex justify-center">
            <img
              src={logo}
              alt="ATLAS Emblem Logo"
              className="h-16 sm:h-20 object-contain drop-shadow-xl"
            />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Aplikasi Terpadu<br />Layanan Arsip dan Sirkulasi
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
            Selamat datang di ATLAS (Aplikasi Terpadu Layanan Arsip dan Sirkulasi). Sebagai inovasi dari Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng, sistem ini hadir untuk mendekatkan jendela literasi dan menjaga rekam jejak sejarah melalui layanan kearsipan dan perpustakaan yang cepat, akurat, dan berbasis teknologi.
          </p>
        </div>
      </section>

      {/* 3. Floating Search Box (Pencarian Katalog) */}
      <section className="relative z-20 -mt-14 sm:-mt-20 max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-7 space-y-4">
          {/* Top Search Input Bar */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-48 px-4 py-3 bg-slate-100/90 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-[#032360] focus:outline-none cursor-pointer"
            >
              <option value="Judul Buku">Judul Buku</option>
              <option value="Pengarang">Pengarang</option>
              <option value="Subjek">Subjek</option>
              <option value="Penerbit">Penerbit</option>
            </select>

            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Masukkan kata kunci pencarian judul, pengarang, topik..."
                className="w-full pl-10 pr-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#002B66] focus:ring-1 focus:ring-[#002B66]"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Cari Katalog</span>
            </button>
          </form>

          {/* Bottom Filter Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            <input
              type="text"
              value={filterPengarang}
              onChange={(e) => setFilterPengarang(e.target.value)}
              placeholder="Filter Pengarang..."
              className="px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={filterPenerbit}
              onChange={(e) => setFilterPenerbit(e.target.value)}
              placeholder="Filter Penerbit..."
              className="px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={filterSubjek}
              onChange={(e) => setFilterSubjek(e.target.value)}
              placeholder="Filter Subjek..."
              className="px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              placeholder="Filter Tahun (cth. 2023)"
              className="px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            <select
              value={filterBahan}
              onChange={(e) => setFilterBahan(e.target.value)}
              className="col-span-2 sm:col-span-1 px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Semua Jenis Bahan">Semua Jenis Bahan</option>
              <option value="Buku Cetak">Buku Cetak</option>
              <option value="Digital/E-Book">Digital / E-Book</option>
              <option value="Majalah/Jurnal">Majalah / Jurnal</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. Main Body Content (2 Columns Layout) */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR (4 columns) */}
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
                  <span className="block text-xl font-extrabold text-[#032360] mt-1">
                    {totalCount !== null ? totalCount.toLocaleString('id-ID') : '3.482'}
                  </span>
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

            {/* Card 2: Pendaftaran Anggota (Hanya tampil jika belum login) */}
            {!isAuthenticated && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-[#032360] font-bold text-base border-b border-slate-100 pb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Pendaftaran Anggota</span>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#032360] leading-snug">
                    Belum Punya Kartu Anggota (KTA)?
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Daftarkan diri secara online untuk akses peminjaman buku sirkulasi, reservasi bahan pustaka, dan fasilitas baca digital.
                  </p>

                  <ul className="space-y-1.5 text-[11px] text-slate-700 font-medium pt-1">
                    <li className="flex items-center gap-1.5 text-emerald-700">
                      <span>✓</span> <span>Daftar menjadi anggota secara online</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700">
                      <span>✓</span> <span>Cetak kartu anggota saat kunjungan</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/register')}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Daftar Anggota Baru</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Layanan Mandiri */}
            <LayananMandiriCard />
          </aside>

          {/* RIGHT MAIN CONTENT (8 columns) */}
          <section className="lg:col-span-8 space-y-6">
            {/* Header & Lihat Semua Koleksi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#032360] tracking-tight">
                  Koleksi Terbaru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Buku-buku yang baru saja ditambahkan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/opac')}
                className="px-5 py-2 rounded-full bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span>Lihat Semua Koleksi</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* 8 Book Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex flex-col justify-between animate-pulse"
                  >
                    <div>
                      <div className="w-full h-44 rounded-xl bg-slate-200" />
                      <div className="mt-3 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="mt-3.5 h-8 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
                <p className="text-rose-700 text-sm font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => loadBooks()}
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
                <p className="text-sm font-bold text-slate-700">Belum ada koleksi buku yang tersedia.</p>
                <p className="text-xs text-slate-500">Silakan tambahkan data buku melalui modul manajemen katalog buku.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {books.map((book) => (
                  <div
                    key={book.id || book.title}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover Card */}
                      <BookCover book={book} className="w-full h-44 rounded-xl" iconClassName="w-8 h-8" />

                      {/* Book Metadata */}
                      <div className="mt-3">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={book.author_main || book.author}>
                          {book.author_main || book.author || 'Penulis Tidak Diketahui'}
                        </p>

                        <div className="flex items-center justify-between text-[10px] mt-2.5 pt-2 border-t border-slate-100">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              (book.available_copies ?? 1) > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {(book.available_copies ?? 1) > 0
                              ? `${book.available_copies ?? 1} Tersedia`
                              : 'Habis'}
                          </span>
                          {book.publish_year && (
                            <span className="text-slate-400 font-medium">{book.publish_year}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/books/${book.id}`)}
                      className="mt-3 w-full py-1.5 rounded-full border border-indigo-500/40 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all cursor-pointer text-center active:scale-95"
                    >
                      Lihat Detail
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Banner: Butuh Bantuan Pustakawan? */}
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#002B66] text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A8.25 8.25 0 0112 3.75 8.25 8.25 0 0121.75 12v.75a3 3 0 01-3 3h-.75a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 011.5-1.5h1.5A6.75 6.75 0 0012 5.25 6.75 6.75 0 005.25 12h1.5A1.5 1.5 0 018.25 13.5v3A1.5 1.5 0 016.75 18h-.75a3 3 0 01-3-3v-.75zM12 18.75a2.25 2.25 0 002.25-2.25H9.75A2.25 2.25 0 0012 18.75z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#032360]">
                    Butuh Bantuan Pustakawan?
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Layanan konsultasi referensi, peminjaman koleksi khusus, dan pemesanan buku santri.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/6285753341689"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white border border-indigo-500/40 text-[#032360] font-bold text-xs hover:bg-slate-50 shadow-sm transition-all shrink-0 cursor-pointer inline-flex items-center justify-center gap-2 active:scale-95 text-center"
              >
                <span>Hubungi Pustakawan</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* 5. Footer Section Terpadu */}
      <Footer />
    </div>
  )
}
