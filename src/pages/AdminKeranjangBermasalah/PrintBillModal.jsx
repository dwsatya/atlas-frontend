import { Printer, X, Download, ShieldCheck, AlertTriangle } from 'lucide-react'
import logo from '../../assets/Logo.png'

export default function PrintBillModal({ isOpen, onClose, cart }) {
  if (!isOpen || !cart) return null

  const member = cart.member || {}

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header toolbar */}
        <div className="px-6 py-4 bg-[#0B2256] text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Berita Acara Pembekuan Akses Sirkulasi
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 bg-white text-slate-800 text-xs printable-area">
          {/* Kop Surat Resmi */}
          <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-800">
            <img
              src={logo}
              alt="Logo Buleleng"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div className="text-center flex-1">
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-700">
                PEMERINTAH KABUPATEN BULELENG
              </h4>
              <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-tight">
                DINAS ARSIP DAN PERPUSTAKAAN DAERAH
              </h2>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Jl. Veteran No. 23, Singaraja, Bali 81117 • Telp. (0362) 22350
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Laman: https://dapd.bulelengkab.go.id • Pos-el: perpusda@bulelengkab.go.id
              </p>
            </div>
          </div>

          {/* Judul Surat */}
          <div className="text-center space-y-1 py-1">
            <h3 className="text-sm font-bold uppercase underline tracking-wider text-slate-900">
              BERITA ACARA PEMBEKUAN AKSES PINJAM SIRKULASI
            </h3>
            <p className="text-[11px] font-mono text-slate-500">
              Nomor: 041.2 / {cart.id ? String(cart.id).padStart(4, '0') : '0028'} / DAPD-BLL / {new Date().getFullYear()}
            </p>
          </div>

          <p className="text-xs leading-relaxed text-justify">
            Berdasarkan rekaman data Sistem Otomasi Sirkulasi Perpustakaan Daerah (ATLAS) DAPD Kabupaten Buleleng, dengan ini disampaikan kepada pemustaka terdaftar:
          </p>

          {/* Data Pemustaka */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Nomor Anggota</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">: {member.member_no || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Nama Lengkap</span>
              <span className="col-span-2 font-bold text-slate-900">: {member.name || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Kategori / Pekerjaan</span>
              <span className="col-span-2 font-medium text-slate-800">: {member.job_category || 'UMUM'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Instansi / Sekolah</span>
              <span className="col-span-2 font-medium text-slate-800">: {member.institution_name || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Nomor Telepon / WA</span>
              <span className="col-span-2 font-mono text-slate-800">: {member.phone_number || '-'}</span>
            </div>
          </div>

          {/* Rincian Permasalahan & Koleksi */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Rincian Pelanggaran &amp; Koleksi Tertahan:</h4>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 p-2 text-left">Jenis Permasalahan</th>
                  <th className="border border-slate-300 p-2 text-left">Judul Koleksi / Kasus</th>
                  <th className="border border-slate-300 p-2 text-center">Eksemplar / Panggil</th>
                  <th className="border border-slate-300 p-2 text-center">Tindakan Wajib Pemustaka</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-bold text-rose-700">
                    {cart.problem_type_label || cart.problem_type}
                  </td>
                  <td className="border border-slate-300 p-2">
                    <p className="font-semibold text-slate-900">{cart.item_title || '-'}</p>
                    <p className="text-[10px] text-slate-500">{cart.description || '-'}</p>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-mono text-[11px]">
                    {cart.item_barcode || '-'}<br />
                    <span className="text-[10px] text-slate-400">{cart.item_call_number || '-'}</span>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-semibold text-slate-900">
                    Pengembalian / Penggantian Buku Fisik
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ketentuan Tindak Lanjut */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-950 space-y-1 text-[11px]">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Status Tindakan: <span className="underline font-bold">AKSES DIBEKUKAN</span></span>
            </p>
            <p className="leading-relaxed">
              Hak peminjaman koleksi sirkulasi ditangguhkan sementara hingga kewajiban pengembalian atau penggantian fisik buku diselesaikan di loket pelayanan Dinas Arsip dan Perpustakaan Daerah Kabupaten Buleleng. Tidak ada sanksi denda uang tunai.
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="pt-6 flex justify-between items-end text-xs">
            <div className="text-center w-48 space-y-16">
              <p>Pemustaka Terdaftar,</p>
              <div>
                <p className="font-bold underline">{member.name || 'Pemustaka'}</p>
                <p className="text-[10px] text-slate-500 font-mono">{member.member_no || '-'}</p>
              </div>
            </div>

            <div className="text-center w-56 space-y-16">
              <div>
                <p>Singaraja, {currentDate}</p>
                <p>Petugas Layanan Sirkulasi,</p>
              </div>
              <div>
                <p className="font-bold underline">{cart.handled_by || 'Luh Putu Suastini'}</p>
                <p className="text-[10px] text-slate-500">Pustakawan Pelaksana DAPD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-[11px] text-slate-500">
            Dokumen resmi dicetak langsung dari sistem sirkulasi terpadu ATLAS DAPD Buleleng.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
