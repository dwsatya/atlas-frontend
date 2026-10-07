import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import background2 from '../../assets/background2.jpeg'
import logoatlas from '../../assets/logoatlas.png'
import logo from '../../assets/Logo.png'

export default function LandingPage() {
  const navigate = useNavigate()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [category, setCategory] = useState('Judul Buku')
  const [filterPengarang, setFilterPengarang] = useState('')
  const [filterPenerbit, setFilterPenerbit] = useState('')
  const [filterSubjek, setFilterSubjek] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterBahan, setFilterBahan] = useState('Semua Jenis Bahan')

  const books = Array(8).fill({
    title: 'Bahasa Indonesia',
    author: 'Dewa Satya, dkk',
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="bg-[#00255c] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Top-Left Logo Container */}
          <div className="bg-white rounded-2xl px-4 py-2 flex items-center shadow-md cursor-pointer" onClick={() => navigate('/')}>
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
              className="text-white font-bold pb-1 border-b-2 border-whi cursor-pointer"
            >
              Beranda
            </button>
            <a
              href="#opac"
              className="text-white/80 hover:text-white transition-colors"
            >
              OPAC / Katalog
            </a>
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
          <div className="flex flex-col md:flex-row items-center gap-3">
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
              type="button"
              className="w-full md:w-auto px-7 py-3 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Cari Katalog</span>
            </button>
          </div>

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

            {/* Card 2: Pendaftaran Anggota */}
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
                className="px-5 py-2 rounded-full bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Lihat Semua Koleksi</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* 8 Book Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {books.map((book, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Placeholder Cover */}
                    <div className="w-full h-44 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-3 text-center text-slate-400 font-medium text-xs leading-snug">
                      <span>Cover Buku</span>
                      <span>Tidak</span>
                      <span>Ditemukan</span>
                    </div>

                    {/* Book Metadata */}
                    <div className="mt-3">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {book.author}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-3.5 w-full py-1.5 rounded-full border border-indigo-500/40 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>

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

      {/* 5. Footer Section */}
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
