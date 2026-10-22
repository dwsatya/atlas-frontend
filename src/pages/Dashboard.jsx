import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RotateCw,
  Download,
  Barcode,
  Plus,
  ArrowDownToDot,
  ShieldCheck,
  UserCheck,
  Star,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react'
import AdminLayout from '../components/admin/AdminLayout'
import {
  fetchAdminDashboard,
  scanAdminBarcode,
  syncAdminDashboard,
  exportAdminReport,
} from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()

  // State
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showDdcModal, setShowDdcModal] = useState(false)
  const [showOpnameModal, setShowOpnameModal] = useState(false)

  // Live Database States
  const [stats, setStats] = useState(null)
  const [ddcTop, setDdcTop] = useState([])
  const [ddcAll, setDdcAll] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [physicalStatus, setPhysicalStatus] = useState(null)
  const [topBooks, setTopBooks] = useState([])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load live data from Backend API
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchAdminDashboard()
      if (res?.data) {
        setStats(res.data.stats || null)
        setDdcTop(res.data.ddc?.top || [])
        setDdcAll(res.data.ddc?.all || [])
        setRecentActivities(res.data.recent_activities || [])
        setPhysicalStatus(res.data.physical_status || null)
        setTopBooks(res.data.top_books || [])
      }
    } catch (err) {
      console.warn('Could not load live dashboard data from API, using fallback:', err)
      // Fallback state jika backend belum siap
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Handle Quick Barcode Process
  const handleProcessBarcode = async (e) => {
    e.preventDefault()
    const query = barcodeInput.trim()
    if (!query) {
      showToast('Arahkan scanner atau masukkan nomor barcode eksemplar/anggota!', 'error')
      return
    }

    try {
      setIsScanning(true)
      const res = await scanAdminBarcode(query)
      if (res?.success) {
        if (res.type === 'collection') {
          showToast(
            `Koleksi Ditemukan: "${res.data.title}" - Status: ${res.data.status} (${res.data.location})`,
            'success'
          )
        } else if (res.type === 'member') {
          showToast(
            `Anggota Terdaftar: "${res.data.name}" (${res.data.member_no}) - ${res.data.category}`,
            'success'
          )
        } else {
          showToast(res.message || 'Data terdeteksi di database.', 'success')
        }
        setBarcodeInput('')
      }
    } catch (err) {
      showToast(err.message || `Barcode "${query}" tidak ditemukan di database.`, 'error')
    } finally {
      setIsScanning(false)
    }
  }

  // Handle Data Sync
  const handleSyncData = async () => {
    try {
      setIsSyncing(true)
      const res = await syncAdminDashboard()
      await loadDashboardData()
      showToast(res?.message || 'Sinkronisasi data database DAPD Buleleng selesai!')
    } catch (err) {
      showToast(err.message || 'Gagal melakukan sinkronisasi database.', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle Export Rekap
  const handleExport = async (format = 'excel') => {
    try {
      setIsExporting(true)
      await exportAdminReport('circulation', format)
      showToast(`Rekapitulasi sirkulasi perpustakaan (${format.toUpperCase()}) berhasil diunduh!`)
    } catch (err) {
      showToast(err.message || 'Gagal mengekspor laporan perpustakaan.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      {/* Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Page Container */}
      <div className="space-y-4.5 pb-12">
        {/* Top Header Actions (Title & Action Buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B2256] tracking-tight">
              Dashboard Admin Sirkulasi &amp; Pengolahan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pusat kendali operasional perpustakaan, otomasi sirkulasi, dan statistik koleksi DAPD Kab. Buleleng
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Sinkronisasi Data */}
            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Data'}</span>
            </button>

            {/* Export Rekap */}
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-[#0B2556] hover:bg-[#08183c] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Download className="w-3.5 h-3.5 text-white" />
              )}
              <span>{isExporting ? 'Mengunduh...' : 'Export Rekap (Excel)'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Scan Barcode Cepat & 4 Quick Shortcuts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
            SCAN BARCODE CEPAT (ANGGOTA / BUKU / LOKER)
          </div>

          {/* Barcode Search Bar */}
          <form onSubmit={handleProcessBarcode} className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Barcode className="w-4.5 h-4.5 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Arahkan barcode scanner atau ketik No. Barcode eksemplar / No. Anggota..."
                className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {isScanning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isScanning ? 'Mencari...' : 'Proses'}</span>
            </button>
          </form>

          {/* 4 Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Card 1: Entri Katalog Baru */}
            <div
              onClick={() => navigate('/admin/entri-katalog')}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition bg-white flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#0B2256] flex items-center justify-between">
                  <span>Entri Katalog Baru</span>
                  <span className="text-slate-400 group-hover:text-blue-600 transition">&gt;</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Input monograf atau import Excel
                </div>
              </div>
            </div>

            {/* Card 2: Meja Sirkulasi Kilat */}
            <div
              onClick={() => navigate('/admin/sirkulasi/peminjaman')}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs transition bg-white flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ArrowDownToDot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#0B2256] flex items-center justify-between">
                  <span>Meja Sirkulasi Kilat</span>
                  <span className="text-slate-400 group-hover:text-emerald-600 transition">&gt;</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Peminjaman &amp; pengembalian buku
                </div>
              </div>
            </div>

            {/* Card 3: Verifikasi Karantina */}
            <div
              onClick={() => navigate('/admin/karantina')}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition bg-white flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#0B2256] flex items-center justify-between">
                  <span>Verifikasi Karantina</span>
                  <span className="text-slate-400 group-hover:text-amber-600 transition">&gt;</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Tinjau {stats?.total_quarantine ?? 0} judul draf
                </div>
              </div>
            </div>

            {/* Card 4: Presensi & Baca Tempat */}
            <div
              onClick={() => navigate('/admin/presensi')}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition bg-white flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] text-[#0D9488] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#0B2256] flex items-center justify-between">
                  <span>Presensi &amp; Baca Tempat</span>
                  <span className="text-slate-400 group-hover:text-teal-600 transition">&gt;</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Catat kunjungan ruang baca
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 4 Key Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Total Judul Monograf */}
          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total Judul Monograf</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                +{stats?.new_catalogs_this_month ?? 0} bln ini
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[32px] font-extrabold text-[#0B2256] tracking-tight leading-none">
                {stats?.total_catalogs !== undefined ? stats.total_catalogs.toLocaleString('id-ID') : '0'}
              </span>
              <span className="text-xs font-medium text-slate-500">Judul</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                ISBN Terverifikasi: {stats?.isbn_verified ?? 0}
              </span>
              <Link to="/admin/entri-katalog" className="text-blue-600 font-semibold hover:underline text-[11px]">
                Lihat Katalog &rarr;
              </Link>
            </div>
          </div>

          {/* Stat 2: Total Eksemplar Fisik */}
          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total Eksemplar Fisik</span>
              <span className="text-[10px] font-bold text-blue-700 bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                Aktif di Rak
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[32px] font-extrabold text-[#0B2256] tracking-tight leading-none">
                {stats?.total_collections !== undefined ? stats.total_collections.toLocaleString('id-ID') : '0'}
              </span>
              <span className="text-xs font-medium text-slate-500">Buku</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold">
                Tersedia: {stats?.available_collections ?? 0}
              </span>
              <span className="text-amber-600 font-semibold">
                Dipinjam: {stats?.borrowed_collections ?? 0}
              </span>
            </div>
          </div>

          {/* Stat 3: Karantina & Menunggu DDC */}
          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Karantina &amp; Menunggu DDC</span>
              <span className="text-[10px] font-bold text-amber-800 bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                Perlu Tindakan
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[32px] font-extrabold text-[#D97706] tracking-tight leading-none">
                {stats?.total_quarantine ?? 0}
              </span>
              <span className="text-xs font-medium text-slate-500">Judul Draf</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">DDC Belum Lengkap: {stats?.missing_ddc ?? 0}</span>
              <Link
                to="/admin/koleksi"
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                Proses Sekarang
              </Link>
            </div>
          </div>

          {/* Stat 4: Koleksi Digital / E-Resource / Member */}
          <div className="bg-white rounded-xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Anggota Terdaftar</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                Sirkulasi Hari Ini: {stats?.today_circulation ?? 0}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[32px] font-extrabold text-[#0B2256] tracking-tight leading-none">
                {stats?.total_members !== undefined ? stats.total_members.toLocaleString('id-ID') : '0'}
              </span>
              <span className="text-xs font-medium text-slate-500">Pemustaka</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Digital / E-Book: {stats?.digital_count ?? 0}</span>
              <Link
                to="/form-data-diri"
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Entri Anggota &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Section 3: Middle Grid (Left ~65%, Right ~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN (approx 68% / 8 cols on large screens)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4.5">
            {/* Card A: DISTRIBUSI KLASIFIKASI SUBJEK KOLEKSI (DDC) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-bold tracking-wider text-[#0B2256] uppercase">
                    DISTRIBUSI KLASIFIKASI SUBJEK KOLEKSI (DDC)
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Persentase komposisi judul buku berdasarkan standar DDC
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDdcModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Lihat Semua 10 Kelas DDC</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* DDC Bars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                {ddcTop.length > 0 ? (
                  ddcTop.map((item, idx) => (
                    <div key={item.code || idx} className={`space-y-1.5 ${idx === 4 ? 'sm:col-span-2' : ''}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="font-bold text-slate-900">
                          {item.percentage}% <span className="font-normal text-slate-400 text-[11px]">({item.count})</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(item.percentage, 2)}%`,
                            backgroundColor: item.color || '#3B82F6',
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 py-4 text-center text-xs text-slate-400">
                    Memuat data klasifikasi DDC dari database...
                  </div>
                )}
              </div>

              {/* DDC Footer Note */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Standar: DDC Edisi 23 RI</span>
                <span>Diperbarui otomatis dari database</span>
              </div>
            </div>

            {/* Card B: AKTIVITAS PENGOLAHAN & ENTRI KATALOG TERBARU */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-bold tracking-wider text-[#0B2256] uppercase">
                    AKTIVITAS PENGOLAHAN &amp; ENTRI KATALOG TERBARU
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Daftar judul monograf terakhir yang dimasukkan oleh pustakawan
                  </p>
                </div>
                <Link
                  to="/admin/entri-katalog"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Lihat Bibliografi</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left border-collapse min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-bold">JUDUL &amp; PERNYATAAN TANGGUNG JAWAB</th>
                      <th className="pb-2.5 font-bold text-center">NO. KLAS</th>
                      <th className="pb-2.5 font-bold">PENGINPUT</th>
                      <th className="pb-2.5 font-bold">WAKTU</th>
                      <th className="pb-2.5 font-bold text-center">STATUS</th>
                      <th className="pb-2.5 font-bold text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Judul & Tanggung Jawab */}
                          <td className="py-3 pr-3">
                            <div className="font-bold text-slate-900 leading-snug">
                              {act.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {act.subtitle}
                            </div>
                          </td>

                          {/* No. Klas */}
                          <td className="py-3 px-2 text-center">
                            <span className={`font-mono font-bold ${act.ddcColor}`}>
                              {act.ddc}
                            </span>
                          </td>

                          {/* Penginput */}
                          <td className="py-3 px-2 text-slate-700 whitespace-nowrap">
                            {act.officer}
                          </td>

                          {/* Waktu */}
                          <td className="py-3 px-2 text-slate-500 whitespace-nowrap text-[11px]">
                            {act.time}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${act.statusBadge}`}>
                              {act.status}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="py-3 pl-2 text-right">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/entri-katalog?edit=${act.id}`)}
                              className={`font-bold hover:underline cursor-pointer ${act.actionColor}`}
                            >
                              {act.actionText}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                          {loading ? 'Memuat data entri katalog...' : 'Belum ada data katalog di database.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Menampilkan {recentActivities.length} entri terbaru dari {stats?.total_catalogs ?? 0} judul katalog
                </span>
                <Link to="/admin/entri-katalog" className="text-blue-600 font-semibold hover:underline">
                  Formulir MARC21 &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (approx 32% / 4 cols on large screens)       */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4.5">
            {/* Card C: STATUS FISIK KOLEKSI */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold tracking-wider text-[#0B2256] uppercase">
                      STATUS FISIK KOLEKSI
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Audit stock opname &amp; sirkulasi
                  </p>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-2.5">
                {/* 1. Kondisi Baik & Siap Rak */}
                <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-800">
                      {physicalStatus?.good?.label || 'Kondisi Baik & Siap Rak'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      {physicalStatus?.good?.percentage ?? 100}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {physicalStatus?.good?.count ?? stats?.total_collections ?? 0} Eks
                    </span>
                  </div>
                </div>

                {/* 2. Rusak Ringan */}
                <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-bold text-slate-800">
                      {physicalStatus?.damaged?.label || 'Rusak / Perlu Perbaikan'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      {physicalStatus?.damaged?.percentage ?? 0}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {physicalStatus?.damaged?.count ?? 0} Eks
                    </span>
                  </div>
                </div>

                {/* 3. Proses Binding / Perbaikan */}
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-slate-800">
                      {physicalStatus?.borrowed?.label || 'Sedang Dipinjam Pemustaka'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      {physicalStatus?.borrowed?.percentage ?? 0}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {physicalStatus?.borrowed?.count ?? stats?.borrowed_collections ?? 0} Eks
                    </span>
                  </div>
                </div>

                {/* 4. Hilang / Klaim Pemustaka */}
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-xs font-bold text-slate-800">
                      {physicalStatus?.quarantine_or_lost?.label || 'Karantina / Hilang'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">
                      {physicalStatus?.quarantine_or_lost?.percentage ?? 0}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {physicalStatus?.quarantine_or_lost?.count ?? 0} Eks
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulir Stock Opname Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(true)}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Formulir Stock Opname</span>
                </button>
              </div>
            </div>

            {/* Card D: TOP KOLEKSI (BULAN INI) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-xs font-bold tracking-wider text-[#0B2256] uppercase">
                    TOP KOLEKSI (BULAN INI)
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-slate-400">Top 3</span>
              </div>

              {/* Ranking List */}
              <div className="space-y-3">
                {topBooks.length > 0 ? (
                  topBooks.map((book) => (
                    <div key={book.rank} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-lg ${book.badgeClass} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                        {book.rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 leading-tight">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{book.callNo}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{book.loans}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Belum ada data koleksi populer.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DDC Modal */}
      {showDdcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B2256]">10 Kelas Utama Dewey Decimal Classification (DDC)</h3>
              <button
                onClick={() => setShowDdcModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700 max-h-[60vh] overflow-y-auto">
              {ddcAll.length > 0 ? (
                ddcAll.map((d) => (
                  <div key={d.code} className="p-2 rounded bg-slate-50 flex justify-between font-mono">
                    <span>{d.name}</span>
                    <span className="font-bold">
                      {d.count} <span className="text-slate-400 font-normal">({d.percentage}%)</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">Memuat klasifikasi DDC...</div>
              )}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowDdcModal(false)}
                className="px-4 py-2 bg-[#0B2556] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Opname Modal */}
      {showOpnameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#0B2256]">Audit Stock Opname Fisik</h3>
              <button
                onClick={() => setShowOpnameModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Mulai sesi verifikasi fisik rak dan penyesuaian status sirkulasi eksemplar koleksi DAPD Buleleng.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Koleksi Terdaftar:</span>
                <span className="font-bold text-slate-800">{stats?.total_collections ?? 0} Eksemplar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Terakhir Audit:</span>
                <span className="font-medium text-slate-700">{physicalStatus?.last_audit || 'Hari Ini'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Petugas Auditor:</span>
                <span className="font-medium text-slate-700">Tim Sirkulasi DAPD</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOpnameModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowOpnameModal(false)
                  showToast('Sesi audit stock opname berhasil dimulai!')
                }}
                className="px-4 py-2 bg-[#0B2556] hover:bg-blue-900 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Mulai Audit Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
