import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  UserCheck,
  Search,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  Bookmark,
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function Panduan() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const guides = [
    {
      category: 'anggota',
      title: 'Cara Mendaftar Kartu Tanda Anggota (KTA) Digital',
      icon: UserCheck,
      color: 'bg-blue-50 text-[#00255c]',
      summary: 'Panduan langkah demi langkah registrasi akun baru dan unduh KTA digital resmi.',
      steps: [
        'Klik tombol "Daftar Akun Baru" di halaman utama atau tombol Login.',
        'Lengkapi formulir registrasi awal dengan memasukkan Email dan Kata Sandi.',
        'Isi formulir kelengkapan data diri sesuai KTP, termasuk alamat, tempat tanggal lahir, kategori pekerjaan, dan unggah pasfoto formal.',
        'Setelah tersimpan, nomor anggota (Member No) resmi dan Kartu Tanda Anggota (KTA) digital dengan barcode langsung diterbitkan di halaman Profil.',
        'Anda dapat mengunduh berkas KTA digital dalam format PDF atau gambar berkualitas tinggi untuk dicetak.',
      ],
    },
    {
      category: 'opac',
      title: 'Panduan Pencarian Buku di Katalog OPAC',
      icon: Search,
      color: 'bg-emerald-50 text-emerald-700',
      summary: 'Tips menemukan buku fisik, naskah kuno, dan ketersediaan stok di rak.',
      steps: [
        'Akses menu OPAC / Katalog melalui tombol utama di navbar bawah atau header.',
        'Ketik kata kunci pencarian pada kolom pencarian (Judul Buku, Nama Pengarang, Topik, atau Nomor ISBN).',
        'Gunakan filter klasifikasi DDC atau jenis bahan (Monograf, Referensi, Bali Klasik) untuk mempersempit hasil pencarian.',
        'Perhatikan status ketersediaan pada buku: label hijau "Tersedia" menandakan buku dapat dipinjam langsung di perpustakaan.',
        'Catat No. Panggil (Call Number) dan Kode Rak untuk memudahkan menemukan buku di lemari koleksi.',
      ],
    },
    {
      category: 'sirkulasi',
      title: 'Ketentuan Peminjaman & Pengembalian Buku',
      icon: RotateCcw,
      color: 'bg-indigo-50 text-indigo-700',
      summary: 'Aturan batas waktu pinjam, kuota eksemplar, dan tata cara pengembalian.',
      steps: [
        'Setiap anggota aktif berhak meminjam maksimal 3 (tiga) eksemplar buku sirkulasi sekaligus.',
        'Durasi peminjaman reguler adalah 7 (tujuh) hari kalender sejak tanggal transaksi di loket perpustakaan.',
        'Peminjam dapat mengajukan perpanjangan waktu pinjam 1 (satu) kali selama buku tidak sedang direservasi oleh pemustaka lain.',
        'Keterlambatan pengembalian buku dikenakan denda administratif sebesar Rp 1.000,- per hari per buku.',
        'Pengembalian buku dapat dilakukan di Meja Sirkulasi Perpustakaan Daerah Kabupaten Buleleng selama jam operasional.',
      ],
    },
    {
      category: 'baca',
      title: 'Layanan Ruang Baca & Presensi Kunjungan di Tempat',
      icon: BookOpen,
      color: 'bg-amber-50 text-amber-700',
      summary: 'Prosedur pemanfaatan ruang baca umum, ruang anak, dan koleksi Gedong Kirtya.',
      steps: [
        'Pengunjung perpustakaan wajib mengisi presensi digital di pintu masuk atau melalui menu Layanan > Baca Ditempat pada ponsel.',
        'Koleksi referensi, kamus, skripsi, dan manuskrip lontar hanya dapat dibaca di dalam ruangan dan tidak diperkenankan dibawa pulang.',
        'Titipkan tas ransel, jaket, dan barang bawaan berukuran besar di loker penitipan yang telah disediakan petugas.',
        'Jaga ketenangan, kebersihan, serta keutuhan buku selama berada di area ruang baca.',
      ],
    },
  ]

  const faqs = [
    {
      q: 'Apakah pendaftaran anggota perpustakaan dipungut biaya?',
      a: 'Pendaftaran anggota perpustakaan daerah di ATLAS sepenuhnya GRATIS tanpa dipungut biaya apapun bagi seluruh masyarakat.',
    },
    {
      q: 'Apakah saya bisa meminjam buku tanpa kartu fisik?',
      a: 'Bisa! Anda cukup menunjukkan KTA Digital dengan barcode resmi dari ponsel pintar Anda melalui menu Profil kepada petugas sirkulasi.',
    },
    {
      q: 'Bagaimana cara mengecek denda atau status buku yang saya pinjam?',
      a: 'Klik menu "Layanan" pada navbar bawah, lalu pilih opsi "Cek Pengembalian". Masukkan nomor anggota Anda untuk melihat rincian tanggal jatuh tempo dan estimasi denda.',
    },
    {
      q: 'Bisakah saya mengusulkan judul buku baru yang belum ada di perpustakaan?',
      a: 'Sangat bisa! Silakan buka menu "Layanan" lalu pilih "Usulan Pengadaan Buku". Tim pengadaan koleksi akan meninjau rekomendasi Anda pada periode pengadaan berikutnya.',
    },
  ]

  const filteredGuides = guides.filter((g) => {
    if (activeCategory !== 'semua' && g.category !== activeCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.steps.some((s) => s.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-28 md:pb-0">
      {/* Navbar Terpadu */}
      <Navbar />

      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-[#00255c] via-[#001D48] to-[#0B2256] text-white py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold border border-white/10">
            <span>Pusat Bantuan &amp; Panduan Perpustakaan</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Panduan Layanan &amp; Penggunaan ATLAS
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Temukan panduan lengkap pendaftaran anggota, penelusuran katalog buku OPAC, aturan sirkulasi peminjaman, serta layanan mandiri perpustakaan.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci panduan (contoh: KTA, pinjam, denda)..."
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-800 placeholder-slate-400 text-xs rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
          {[
            { id: 'semua', label: 'Semua Panduan' },
            { id: 'anggota', label: 'KTA & Anggota' },
            { id: 'opac', label: 'Katalog OPAC' },
            { id: 'sirkulasi', label: 'Peminjaman' },
            { id: 'baca', label: 'Ruang Baca' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs ${activeCategory === cat.id
                  ? 'bg-[#00255c] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Guides List Cards */}
        <div className="space-y-4">
          {filteredGuides.map((guide, idx) => {
            const Icon = guide.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${guide.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0B2256] leading-snug">
                      {guide.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>
                </div>

                {/* Steps List */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Tahapan Pelaksanaan:
                  </span>
                  <div className="space-y-2">
                    {guide.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-[#00255c] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                          {sIdx + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#00255c] pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold">Pertanyaan yang Sering Diajukan (FAQ)</h3>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200/80 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-left flex items-center justify-between text-xs font-bold text-[#0B2256] cursor-pointer transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180 text-blue-600' : ''
                      }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bantuan Pustakawan Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#00255c] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0B2256]">Masih Membutuhkan Bantuan?</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Staf pustakawan Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng siap membantu Anda.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/6285753341689"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#00255c] hover:bg-[#001D48] text-white font-bold text-xs shadow-sm transition active:scale-95 text-center inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Hubungi Pustakawan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
