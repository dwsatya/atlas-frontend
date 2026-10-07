/**
 * Komponen Footer Terpadu & Seragam ATLAS
 * Menampilkan informasi Dinas Arsip & Perpustakaan Daerah Kabupaten Buleleng, waktu layanan, dan kontak resmi
 */
export default function Footer() {
  return (
    <footer className="bg-[#001D48] text-white pt-12 pb-6 border-t border-[#001738] mt-16 w-full">
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
  )
}
