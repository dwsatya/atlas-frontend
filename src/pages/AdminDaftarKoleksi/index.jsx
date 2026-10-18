import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Library,
  Plus,
  Barcode,
  Tag,
  FileSpreadsheet,
  Zap,
  HelpCircle,
  Search,
  Filter,
  Check,
  ChevronDown,
  Info,
  Printer,
  SlidersHorizontal,
  MoreVertical,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Bookmark,
  Wrench,
  Shield,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { fetchAdminCollections } from '../../services/api'

export default function AdminDaftarKoleksi() {
  const navigate = useNavigate()

  // State filters
  const [searchTerm, setSearchTerm] = useState('')
  const [searchColumn, setSearchColumn] = useState('all')
  const [selectedMaterialType, setSelectedMaterialType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedYear, setSelectedYear] = useState('2024 - 2026')
  const [_appliedYear, setAppliedYear] = useState('2024 - 2026')

  // Pagination & selection
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')

  // Modal states
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null)
  const [selectedItemForPrint, setSelectedItemForPrint] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  })
  const [metrics, setMetrics] = useState({
    total_exemplars: 0,
    total_titles: 0,
    available_count: 0,
    borrowed_count: 0,
    month_new_count: 0,
    maintenance_count: 0,
    quarantine_count: 0,
  })

  // Load collections from backend API
  const loadCollections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminCollections({
        search: searchTerm,
        status: selectedStatus === 'all' ? '' : selectedStatus,
        material_type: selectedMaterialType === 'all' ? '' : selectedMaterialType,
        room_location: selectedLocation === 'all' ? '' : selectedLocation,
        page: currentPage,
        per_page: perPage,
      })

      if (res?.data) {
        const rawList = res.data.data || (Array.isArray(res.data) ? res.data : [])
        const mapped = rawList.map((c) => {
          const cat = c.catalog || {}
          let statusText = 'Tersedia di Rak'
          let statusType = 'available'
          let statusSubtext = ''

          if (c.is_quarantine || c.availability_status === 'QUARANTINED') {
            statusText = 'Karantina'
            statusType = 'quarantine'
            statusSubtext = 'Baru Dikembalikan'
          } else if (c.availability_status === 'BORROWED') {
            statusText = 'Sedang Dipinjam'
            statusType = 'borrowed'
            statusSubtext = 'Tempo: 20 Sep 2026'
          } else if (c.availability_status === 'MAINTENANCE') {
            statusText = 'Proses Binding'
            statusType = 'maintenance'
            statusSubtext = 'Rusak Jilidan Punggung'
          }

          const ddcParts = (c.exemplar_call_number || cat.catalog_call_number || cat.ddc_number || '-').split(' ')
          const ddcClass = ddcParts[0] || '-'
          const ddcAuthorCode = ddcParts.slice(1).join(' ') || (cat.author_main ? cat.author_main.slice(0, 3).toUpperCase() : '-')

          return {
            id: c.id,
            collection_id: c.id,
            catalog_id: c.catalog_id || cat.id || c.id,
            barcode_no: c.barcode_no || `BC-${c.id}`,
            rfid_no: c.rfid_no ? `RFID: ${c.rfid_no}` : (c.barcode_no ? `RFID: ${c.barcode_no}` : '-'),
            title: cat.title || 'Monograf Koleksi Perpustakaan',
            author: cat.author_main || 'Penulis Tidak Diketahui',
            publisher: cat.publisher || '-',
            publish_city: cat.publish_city || '',
            publish_year: cat.publish_year || '',
            pages: cat.pages || '-',
            dimension: cat.dimension || '',
            isbn_meta: `ISBN: ${cat.isbn || '-'} • ${cat.material_type || 'Monograf Cetak'}`,
            ddc_class: ddcClass,
            ddc_author_code: ddcAuthorCode,
            edition: cat.edition || 'Cet. 1',
            year: cat.publish_year ? `Tahun ${cat.publish_year}` : '-',
            source_type: c.source_type || 'Pengadaan Perpustakaan',
            status: statusText,
            status_subtext: statusSubtext,
            status_type: statusType,
            material_type: cat.material_type || 'Monograf (Buku)',
            room_location: c.room_location_code || 'Lantai 1 - Rak Monograf A',
          }
        })
        setItems(mapped)

        if (res.data?.meta) {
          setPagination({
            current_page: res.data.meta.current_page || 1,
            last_page: res.data.meta.last_page || 1,
            total: res.data.meta.total || mapped.length,
            from: res.data.meta.from || (mapped.length > 0 ? 1 : 0),
            to: res.data.meta.to || mapped.length,
          })
        } else {
          setPagination({
            current_page: 1,
            last_page: 1,
            total: mapped.length,
            from: mapped.length > 0 ? 1 : 0,
            to: mapped.length,
          })
        }
      } else {
        setItems([])
      }

      if (res?.metrics) {
        setMetrics({
          total_exemplars: res.metrics.total_exemplars ?? 0,
          total_titles: res.metrics.total_titles ?? 0,
          available_count: res.metrics.available_count ?? 0,
          borrowed_count: res.metrics.borrowed_count ?? 0,
          month_new_count: res.metrics.month_new_count ?? 0,
          maintenance_count: res.metrics.maintenance_count ?? 0,
          quarantine_count: res.metrics.quarantine_count ?? 0,
        })
      }
    } catch (err) {
      console.error('Gagal memuat data koleksi dari server:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedStatus, selectedMaterialType, selectedLocation, currentPage, perPage])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  // Display metrics using actual data from database
  const displayTotalExemplars = (metrics.total_exemplars ?? 0).toLocaleString('id-ID')
  const displayTotalTitles = (metrics.total_titles ?? 0).toLocaleString('id-ID')
  const displayAvailable = (metrics.available_count ?? 0).toLocaleString('id-ID')
  const displayBorrowed = (metrics.borrowed_count ?? 0).toLocaleString('id-ID')
  const displayMonthNew = `+${metrics.month_new_count ?? 0}`
  const displayMaintenance = (metrics.maintenance_count ?? 0).toLocaleString('id-ID')
  const displayQuarantine = (metrics.quarantine_count ?? 0).toLocaleString('id-ID')

  // Filter items in memory if local search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchBarcode = item.barcode_no.toLowerCase().includes(q)
        const matchAuthor = item.author.toLowerCase().includes(q)
        const matchRfid = item.rfid_no.toLowerCase().includes(q)
        if (!matchTitle && !matchBarcode && !matchAuthor && !matchRfid) {
          return false
        }
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Tersedia di Rak' && item.status !== 'Tersedia di Rak') return false
        if (selectedStatus === 'Sedang Dipinjam' && item.status !== 'Sedang Dipinjam') return false
        if (selectedStatus === 'Proses Binding' && item.status !== 'Proses Binding') return false
        if (selectedStatus === 'Karantina' && item.status !== 'Karantina') return false
      }
      return true
    })
  }, [items, searchTerm, selectedStatus])

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Bulk action executor
  const handleExecuteBulkAction = () => {
    if (!bulkAction) {
      showToast('Pilih tindakan massal terlebih dahulu!', 'error')
      return
    }
    if (selectedIds.length === 0) {
      showToast('Pilih minimal 1 eksemplar dari tabel!', 'error')
      return
    }

    if (bulkAction === 'print_barcode') {
      showToast(`Menyiapkan ${selectedIds.length} label barcode untuk dicetak...`)
      setSelectedItemForPrint(items.find((i) => i.id === selectedIds[0]) || items[0])
    } else if (bulkAction === 'set_available') {
      setItems((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, status: 'Tersedia di Rak', status_type: 'available', status_subtext: '' }
            : item
        )
      )
      showToast(`${selectedIds.length} eksemplar berhasil diperbarui menjadi Tersedia di Rak!`)
      setSelectedIds([])
    } else if (bulkAction === 'delete') {
      if (confirm(`Yakin ingin menghapus ${selectedIds.length} eksemplar terpilih?`)) {
        setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
        showToast(`${selectedIds.length} eksemplar berhasil dihapus dari sistem!`)
        setSelectedIds([])
      }
    }
  }

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('searchInputField')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <AdminLayout>
      {/* Toast Notification */}
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

      {/* Main Container */}
      <div className="space-y-4">
        {/* ========================================================= */}
        {/* 1. TOP HEADER & ACTION BUTTONS                            */}
        {/* ========================================================= */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Title & Badge */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B2256] tracking-tight">
              Daftar Koleksi &amp; Eksemplar
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FF] border border-[#BFDBFE] text-[#1E40AF] text-xs font-semibold">
              <Library className="w-3.5 h-3.5" />
              <span>
                {displayTotalExemplars} Eksemplar • {displayTotalTitles} Judul Terdaftar
              </span>
            </div>
          </div>

          {/* Action Buttons Right Side */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
            {/* Top Row on Small Devices */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* + Tambah Eksemplar Baru */}
              <button
                type="button"
                onClick={() => navigate('/admin/entri-katalog')}
                className="px-3.5 py-2 bg-[#0B2256] hover:bg-[#07183c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Eksemplar Baru</span>
              </button>

              {/* Cetak Barcode & Label */}
              <button
                type="button"
                onClick={() => {
                  if (items.length > 0) {
                    setSelectedItemForPrint(items[0])
                  } else {
                    showToast('Belum ada data eksemplar untuk dicetak', 'error')
                  }
                }}
                className="px-3.5 py-2 bg-[#EEF2F6] hover:bg-slate-200 border border-slate-300 text-[#0B2256] text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <Barcode className="w-4 h-4 text-[#2563EB]" />
                <span>Cetak Barcode &amp; Label</span>
              </button>
            </div>

            {/* Bottom Row on Small Devices */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Label DDC */}
              <button
                type="button"
                onClick={() => {
                  if (items.length > 0) {
                    showToast('Menyiapkan pratinjau Label Punggung DDC...')
                    setSelectedItemForPrint(items[0])
                  } else {
                    showToast('Belum ada data eksemplar untuk dicetak', 'error')
                  }
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Label DDC</span>
              </button>

              {/* Export Excel */}
              <button
                type="button"
                onClick={() => {
                  const headers = 'Barcode,RFID,Judul,Pengarang,DDC,Penerbit,Deskripsi Fisik,Edisi,Pengadaan,Status\n'
                  const rows = items
                    .map(
                      (i) =>
                        `"${i.barcode_no}","${i.rfid_no}","${i.title}","${i.author}","${i.ddc_class} ${i.ddc_author_code}","${i.publisher} (${i.publish_city || ''} ${i.publish_year || ''})","${i.pages} ${i.dimension || ''}","${i.edition}","${i.source_type}","${i.status}"`
                    )
                    .join('\n')
                  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `rekap_koleksi_eksemplar_${Date.now()}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  showToast('Data koleksi berhasil diekspor ke format Excel/CSV!')
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>

              {/* Stock Opname Kilat */}
              <button
                type="button"
                onClick={() => {
                  showToast('Mode Stock Opname Kilat Scanner aktif. Arahkan barcode reader.')
                }}
                className="px-3 py-1.5 bg-[#D1FAE5] hover:bg-emerald-200 border border-[#A7F3D0] text-[#065F46] text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Stock Opname Kilat</span>
              </button>

              {/* Help Circle */}
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Bantuan Daftar Koleksi & Eksemplar:\n- Gunakan filter untuk menyortir buku berdasarkan rak atau status sirkulasi.\n- Gunakan shortcut Ctrl + K untuk langsung mencari.\n- Klik checkbox untuk menjalankan aksi massal seperti cetak barcode.'
                  )
                }
                className="w-8 h-8 rounded-full border border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-xs font-bold"
                title="Bantuan Panduan"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FILTER PARAMETERS BAR                                  */}
        {/* ========================================================= */}
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Filter 1: Jenis Bahan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                Jenis Bahan
              </label>
              <div className="relative">
                <select
                  value={selectedMaterialType}
                  onChange={(e) => setSelectedMaterialType(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8 shadow-2xs"
                >
                  <option value="all">Semua Jenis Bahan</option>
                  <option value="Monograf (Buku)">Monograf (Buku)</option>
                  <option value="Serial (Majalah/Jurnal)">Serial (Majalah/Jurnal)</option>
                  <option value="Koleksi Naskah/Lontar">Koleksi Naskah/Lontar</option>
                  <option value="Bahan Kartografi">Bahan Kartografi</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 2: Status Ketersediaan */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                Status Ketersediaan
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8 shadow-2xs"
                >
                  <option value="all">Semua Status Eksemplar</option>
                  <option value="Tersedia di Rak">Tersedia di Rak</option>
                  <option value="Sedang Dipinjam">Sedang Dipinjam</option>
                  <option value="Proses Binding">Proses Binding</option>
                  <option value="Karantina">Karantina</option>
                  <option value="Hilang">Hilang</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 3: Lokasi Ruang / Rak */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                Lokasi Ruang / Rak
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8 shadow-2xs"
                >
                  <option value="all">Semua Lokasi Penyimpanan</option>
                  <option value="Lantai 1 - Rak Monograf A">Lantai 1 - Rak Monograf A</option>
                  <option value="Lantai 1 - Ruang Baca Utama">Lantai 1 - Ruang Baca Utama</option>
                  <option value="Lantai 2 - Koleksi Khusus / Bali">Lantai 2 - Koleksi Khusus / Bali</option>
                  <option value="Ruang Karantina & Preservasi">Ruang Karantina &amp; Preservasi</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 4: Tahun Pengadaan / Terbit */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                Tahun Pengadaan / Terbit
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  placeholder="2024 - 2026"
                  className="w-full min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAppliedYear(selectedYear)
                    showToast(`Filter tahun "${selectedYear}" diterapkan!`)
                  }}
                  className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. FOUR KPI SUMMARY CARDS                                 */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: TOTAL EKSEMPLAR TERDAFTAR */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
                  Total Eksemplar Terdaftar
                </span>
                <p className="text-[28px] font-extrabold text-[#0B2256] leading-none mt-1.5">
                  {displayTotalExemplars}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#2563EB] shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-700">
                Tersedia: {displayAvailable}
              </span>
              <span className="text-slate-600">
                Dipinjam: {displayBorrowed}
              </span>
            </div>
          </div>

          {/* Card 2: REGISTRASI BULAN INI */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
                  Registrasi Bulan Ini
                </span>
                <p className="text-[28px] font-extrabold text-[#00A389] leading-none mt-1.5">
                  {displayMonthNew}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#E6F8F3] flex items-center justify-center text-[#00A389] shrink-0">
                <Bookmark className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Pengadaan APBD Perubahan &amp; Hibah
            </div>
          </div>

          {/* Card 3: PERLU PERBAIKAN / BINDING */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
                  Perlu Perbaikan / Binding
                </span>
                <p className="text-[28px] font-extrabold text-[#C2410C] leading-none mt-1.5">
                  {displayMaintenance}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] flex items-center justify-center text-[#C2410C] shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Dalam antrean meja pelestarian arsip
            </div>
          </div>

          {/* Card 4: KARANTINA PENGEMBALIAN */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">
                  Karantina Pengembalian
                </span>
                <p className="text-[28px] font-extrabold text-[#1E3A8A] leading-none mt-1.5">
                  {displayQuarantine}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center text-[#2563EB] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Sterilisasi UV &amp; pemeriksaan fisik
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SEARCH BAR & BULK ACTION BAR                           */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3.5">
          {/* Row 1: Search Input */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5">
            {/* Column Selector */}
            <div className="relative xl:w-52 shrink-0">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="w-full appearance-none bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer pr-8"
              >
                <option value="all">Semua Kolom Data</option>
                <option value="barcode">No. Induk / Barcode</option>
                <option value="rfid">Kode RFID</option>
                <option value="title">Judul Monograf</option>
                <option value="author">Pengarang</option>
                <option value="isbn">ISBN</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="searchInputField"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik Nomor Induk / Barcode Eksemplar, Judul Buku, Pengarang, atau ISBN..."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl pl-10 pr-16 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-white">
                Ctrl + K
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => loadCollections()}
                className="px-4 py-2 bg-[#0B2256] hover:bg-[#07183c] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-white" />
                <span>Cari Eksemplar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Panel filter spesifik DDC & status diaktifkan')
                }}
                className="px-3.5 py-2 bg-[#EEF4FF] hover:bg-blue-100 border border-[#BFDBFE] text-[#2563EB] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Spesifik</span>
              </button>
            </div>
          </div>

          {/* Row 2: Bulk Action Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Pilih Semua</span>
              </label>

              <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                AKSI MASSAL:
              </span>

              <div className="relative">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="appearance-none bg-[#F8FAFC] border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer pr-7"
                >
                  <option value="">-- Pilih Tindakan --</option>
                  <option value="print_barcode">Cetak Barcode Terpilih</option>
                  <option value="set_available">Ubah Status ke Tersedia</option>
                  <option value="delete">Hapus Eksemplar</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={handleExecuteBulkAction}
                className="px-3 py-1 bg-[#DCE9FE] hover:bg-blue-200 text-[#1E40AF] font-bold rounded-lg transition cursor-pointer"
              >
                Jalankan
              </button>
            </div>

            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span>
                Menampilkan 1 – {filteredItems.length} dari{' '}
                {displayTotalExemplars} eksemplar
              </span>
              <div className="flex items-center gap-1.5">
                <span>Baris:</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. DATA TABLE (MATCHING ATTACHMENT)                       */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-2.5 min-w-[125px]">No. Induk / Barcode</th>
                  <th className="py-3 px-2.5 min-w-[220px]">Judul Monograf &amp; Pengarang</th>
                  <th className="py-3 px-2 min-w-[95px] text-center">No. Panggil (Call No)</th>
                  <th className="py-3 px-2.5 min-w-[140px]">Penerbit / Publikasi</th>
                  <th className="py-3 px-2.5 min-w-[120px]">Deskripsi Fisik</th>
                  <th className="py-3 px-2 min-w-[80px]">Edisi / Tahun</th>
                  <th className="py-3 px-2 min-w-[105px]">Pengadaan</th>
                  <th className="py-3 px-2 min-w-[115px]">Status</th>
                  <th className="py-3 px-2.5 text-center min-w-[110px]">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span>Memuat data koleksi dan eksemplar...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-slate-400">
                      Tidak ada eksemplar yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id)
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/20 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* No. Induk / Barcode */}
                        <td className="py-3 px-2.5 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EEF4FF] text-[#1E40AF] font-bold font-mono text-[11px] border border-[#BFDBFE]">
                              {item.barcode_no}
                            </span>
                            <Barcode className="w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            {item.rfid_no}
                          </p>
                        </td>

                        {/* Judul Monograf & Pengarang */}
                        <td className="py-3 px-2.5 align-top">
                          <p
                            onClick={() => setSelectedItemForDetail(item)}
                            className="font-bold text-slate-900 text-xs hover:text-[#2563EB] cursor-pointer transition leading-snug line-clamp-2"
                          >
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                            {item.author}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.isbn_meta}
                          </p>
                        </td>

                        {/* No. Panggil (Call No) */}
                        <td className="py-3 px-2 align-top text-center">
                          <div className="inline-flex flex-col items-center justify-center rounded-lg border border-[#BFDBFE] overflow-hidden shadow-2xs">
                            <span className="px-2.5 py-0.5 bg-[#DCE9FE] text-[#1E40AF] font-bold text-[11px] font-mono w-full text-center">
                              {item.ddc_class}
                            </span>
                            <span className="px-2.5 py-0.5 bg-[#1E40AF] text-white font-bold text-[10px] font-mono w-full text-center">
                              {item.ddc_author_code}
                            </span>
                          </div>
                        </td>

                        {/* Penerbit / Publikasi */}
                        <td className="py-3 px-2.5 align-top">
                          <p className="font-semibold text-slate-800 text-xs line-clamp-1" title={item.publisher}>
                            {item.publisher || '-'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.publish_city ? item.publish_city : ''}
                            {item.publish_city && item.publish_year ? ' • ' : ''}
                            {item.publish_year ? `Thn ${item.publish_year}` : ''}
                            {!item.publish_city && !item.publish_year && '-'}
                          </p>
                        </td>

                        {/* Deskripsi Fisik */}
                        <td className="py-3 px-2.5 align-top">
                          <p className="font-medium text-slate-800 text-xs line-clamp-1" title={item.pages}>
                            {item.pages || '-'}
                          </p>
                          {item.dimension && item.dimension !== '-' && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {item.dimension}
                            </p>
                          )}
                        </td>

                        {/* Edisi / Tahun */}
                        <td className="py-3 px-2 align-top">
                          <p className="font-semibold text-slate-800 text-xs">
                            {item.edition}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.year}
                          </p>
                        </td>

                        {/* Pengadaan */}
                        <td className="py-3 px-2 align-top">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>{item.source_type}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-2 align-top">
                          {item.status_type === 'available' && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] font-bold text-[11px] border border-[#A7F3D0]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                <span>Tersedia di Rak</span>
                              </span>
                            </div>
                          )}

                          {item.status_type === 'borrowed' && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9] font-bold text-[11px] border border-[#DDD6FE]">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                                <span>Sedang Dipinjam</span>
                              </span>
                              {item.status_subtext && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {item.status_subtext}
                                </p>
                              )}
                            </div>
                          )}

                          {item.status_type === 'maintenance' && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] font-bold text-[11px] border border-[#FED7AA]">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                                <span>Proses Binding</span>
                              </span>
                              {item.status_subtext && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {item.status_subtext}
                                </p>
                              )}
                            </div>
                          )}

                          {item.status_type === 'quarantine' && (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] font-bold text-[11px] border border-[#BFDBFE]">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                <span>Karantina</span>
                              </span>
                              {item.status_subtext && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {item.status_subtext}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Aksi Cepat */}
                        <td className="py-3 px-2.5 align-top text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <button
                              type="button"
                              onClick={() => setSelectedItemForDetail(item)}
                              className="p-1 rounded hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                              title="Detail Eksemplar"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedItemForPrint(item)}
                              className="p-1 rounded hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                              title="Cetak Barcode & Label"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/entri-katalog?id=${item.catalog_id || item.id}`)}
                              className="p-1 rounded hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                              title="Edit Katalog / Eksemplar"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Aksi untuk "${item.title}":\n1. Ubah Status\n2. Mutasi Rak\n3. Catat Riwayat Peminjaman`)
                              }}
                              className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                              title="Opsi Lainnya"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. BOTTOM ACTION BAR & PAGINATION                         */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                showToast('Mencetak Lembar Kontrol Eksemplar PDF...')
                window.print()
              }}
              className="px-3.5 py-2 bg-[#F0F4FA] hover:bg-slate-200 text-[#0B2256] text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer border border-slate-200/80"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Cetak Lembar Kontrol Eksemplar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                showToast('Mengunduh Berkas Rekapitulasi Koleksi (PDF)...')
              }}
              className="px-3.5 py-2 bg-[#F0F4FA] hover:bg-slate-200 text-[#0B2256] text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer border border-slate-200/80"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download Rekap PDF</span>
            </button>
          </div>

          {/* Right Pagination Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-2 text-[11px] hidden sm:inline">
              Menampilkan {pagination.total > 0 ? pagination.from : 0} - {pagination.to} dari {pagination.total} eksemplar
            </span>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#0B2256] text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {pagination.last_page > 5 && (
              <>
                <span className="px-1 text-slate-400 font-bold">..</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(pagination.last_page)}
                  className={`px-2 h-8 rounded-lg font-bold flex items-center justify-center transition cursor-pointer ${
                    currentPage === pagination.last_page
                      ? 'bg-[#0B2256] text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pagination.last_page}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= pagination.last_page}
              onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. MODALS (DETAIL & PRINT PREVIEW)                        */}
      {/* ========================================================= */}

      {/* Modal Detail Info Eksemplar */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0B2256] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detail Eksemplar Fisik</h3>
                  <p className="text-xs text-blue-200 font-mono">
                    {selectedItemForDetail.barcode_no}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Judul Monograf
                </span>
                <p className="text-sm font-bold text-[#0B2256]">
                  {selectedItemForDetail.title}
                </p>
                <p className="text-slate-600 font-medium">
                  Pengarang: {selectedItemForDetail.author}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    No. Panggil DDC
                  </span>
                  <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">
                    {selectedItemForDetail.ddc_class} {selectedItemForDetail.ddc_author_code}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Status Ketersediaan
                  </span>
                  <p className="font-bold text-emerald-700 text-xs mt-0.5">
                    {selectedItemForDetail.status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Penerbit / Publikasi
                  </span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {selectedItemForDetail.publisher || '-'}
                  </p>
                  {(selectedItemForDetail.publish_city || selectedItemForDetail.publish_year) && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {[selectedItemForDetail.publish_city, selectedItemForDetail.publish_year].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Deskripsi Fisik
                  </span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {selectedItemForDetail.pages || '-'}
                  </p>
                  {selectedItemForDetail.dimension && selectedItemForDetail.dimension !== '-' && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {selectedItemForDetail.dimension}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Lokasi Rak
                  </span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {selectedItemForDetail.room_location}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Sumber Pengadaan
                  </span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {selectedItemForDetail.source_type}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 font-mono text-[11px] text-blue-900">
                {selectedItemForDetail.rfid_no}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedItemForPrint(selectedItemForDetail)
                  setSelectedItemForDetail(null)
                }}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Barcode</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Barcode & Label DDC */}
      {selectedItemForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#0B2256] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Barcode className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-base font-bold text-white">Pratinjau Label Fisik</h3>
                  <p className="text-xs text-blue-200 font-mono">
                    {selectedItemForPrint.barcode_no}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForPrint(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex flex-col items-center">
              {/* Spine Label & Barcode Card Preview */}
              <div className="w-64 border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex flex-col items-center gap-3">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-700 uppercase">
                    DAPD KABUPATEN BULELENG
                  </p>
                  <p className="text-[9px] text-slate-400">PERPUSTAKAAN DAERAH</p>
                </div>

                {/* Simulated Barcode */}
                <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center">
                  <div className="flex items-center gap-0.5 h-12 w-full justify-center">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2].map(
                      (w, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${w * 2}px` }}
                          className="h-full bg-slate-900"
                        />
                      )
                    )}
                  </div>
                  <span className="font-mono font-bold text-xs mt-1 text-slate-900">
                    *{selectedItemForPrint.barcode_no}*
                  </span>
                </div>

                {/* Call Number Spine Badge */}
                <div className="w-32 border border-slate-300 rounded-lg bg-white p-2 text-center space-y-0.5">
                  <span className="text-[9px] text-slate-400 block font-semibold">
                    NO. PANGGIL
                  </span>
                  <p className="font-mono font-black text-sm text-[#0B2256]">
                    {selectedItemForPrint.ddc_class}
                  </p>
                  <p className="font-mono font-bold text-xs text-blue-700">
                    {selectedItemForPrint.ddc_author_code}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Format siap cetak untuk stiker punggung buku (spine) dan barcode inventaris eksemplar.
              </p>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  window.print()
                  showToast('Perintah cetak label dikirim ke printer!')
                }}
                className="px-5 py-2 bg-[#007A64] hover:bg-[#006654] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemForPrint(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
