import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Archive,
  Copy,
  FileSpreadsheet,
  Trash2,
  Plus,
  RotateCw,
  HelpCircle,
  Search,
  Filter,
  Check,
  CheckCircle2,
  X,
  Columns3,
  LayoutGrid,
  FileDown,
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  AlertCircle,
  Eye,
  Pencil,
  MoreVertical,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileText,
  Globe,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import DetailModal from './DetailModal'
import ValidasiModal from './ValidasiModal'
import MergeModal from './MergeModal'
import HelpModal from './HelpModal'
import PublishOpacModal from './PublishOpacModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import {
  fetchAdminQuarantine,
  restoreQuarantineCatalog,
  validateAndSaveCatalog,
  deleteAdminCatalog,
  bulkRestoreQuarantineCatalogs,
  bulkDeleteQuarantineCatalogs,
} from '../../services/api'

export default function AdminKarantinaKoleksi() {
  // Master state collections (dari database riil, bukan mock)
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all', 'duplikasi', 'data_belum_lengkap', 'dihapus_sementara'

  // Filter builder states
  const [combineLogic, setCombineLogic] = useState('dan') // 'dan' or 'atau'
  const [filterRows, setFilterRows] = useState([
    {
      id: 1,
      field: 'Judul Buku',
      value: '',
    },
  ])

  // Active filter query applied to table
  const [appliedFilters, setAppliedFilters] = useState({
    active: false,
    logic: 'dan',
    rows: [],
  })

  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction] = useState('')

  // Pagination & view layout
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [viewMode, setViewMode] = useState('table') // 'table', 'grid', 'report'

  // Modals state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null)
  const [selectedItemForValidasi, setSelectedItemForValidasi] = useState(null)
  const [selectedItemForMerge, setSelectedItemForMerge] = useState(null)
  const [selectedItemForPublish, setSelectedItemForPublish] = useState(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [selectedItemForDelete, setSelectedItemForDelete] = useState(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Loading & toast feedback
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load / Sync with backend API
  const loadQuarantineData = useCallback(async (showNotification = false) => {
    setLoading(true)
    try {
      const res = await fetchAdminQuarantine({ per_page: 100 })
      const rawList = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])

      if (rawList && rawList.length > 0) {
        const mappedFromDb = rawList.map((c) => {
          const catId = c.id
          const hasDdc = Boolean(c.ddc_number && c.ddc_number !== '-')
          const isDupe = Boolean(
            c.quarantine_reason?.toLowerCase().includes('duplikasi')
          )
          const isDeleted = Boolean(
            c.quarantine_reason?.toLowerCase().includes('hapus') ||
            c.quarantine_reason?.toLowerCase().includes('write-off')
          )

          let category = 'data_belum_lengkap'
          let reason = c.quarantine_reason || 'Belum Dilengkapi No Klasifikasi DDC'
          if (isDupe) {
            category = 'duplikasi'
          } else if (isDeleted) {
            category = 'dihapus_sementara'
          } else if (!hasDdc) {
            category = 'data_belum_lengkap'
          }

          return {
            id: catId,
            db_id: catId,
            bibid: `BIB - ${String(catId).padStart(5, '0')}`,
            is_rda: Boolean(c.is_rda ?? true),
            title: c.title,
            author: c.author_main || 'Penulis Tidak Diketahui',
            edition: c.edition || 'Cet. 1',
            publisher: `${c.publish_city || 'Buleleng'}: ${c.publisher || 'Perpustakaan'}`,
            publish_year: `Tahun ${c.publish_year || '2026'}`,
            physical_description: `${c.pages || 'xx, 200 hlm.'}; ${
              c.dimension || '21 cm'
            }`,
            subject: c.subject_topic || 'Koleksi Umum',
            category,
            quarantine_reason: reason,
            isbn: c.isbn || '-',
            ddc: c.ddc_number || '',
            call_number: c.catalog_call_number || '',
            days_in_quarantine: 1,
            copies_count: c.collections?.length || c.total_copies || 1,
            notes:
              c.abstract ||
              reason ||
              'Dimasukkan ke keranjang karantina dari modul entri katalog/koleksi.',
            barcode_no: c.barcode_no || null,
            physical_condition: c.physical_condition || 'Rusak',
            is_collection: Boolean(c.is_collection),
            collection_id: c.collection_id || null,
            catalog_id: c.catalog_id || null,
            priority: 'Prioritas 1',
            is_real_db: true,
          }
        })

        setItems(mappedFromDb)
        if (showNotification) {
          showToast(
            `${mappedFromDb.length} rekaman karantina dari database berhasil dimuat.`
          )
        }
      } else {
        setItems([])
        if (showNotification) {
          showToast('Tidak ada data koleksi di keranjang karantina.', 'info')
        }
      }
    } catch (err) {
      console.warn('Sync quarantine failed:', err)
      setItems([])
      if (showNotification) {
        showToast('Gagal memuat data karantina dari server.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto load on component mount
  useEffect(() => {
    loadQuarantineData(false)
  }, [loadQuarantineData])

  // Filter Row Helpers
  const handleAddFilterRow = () => {
    setFilterRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        field: 'Judul Buku',
        value: '',
      },
    ])
  }

  const handleRemoveFilterRow = (id) => {
    if (filterRows.length <= 1) {
      // Clear single row instead of removing to preserve UI structure
      setFilterRows([
        {
          id: Date.now(),
          field: 'Judul Buku',
          value: '',
        },
      ])
      return
    }
    setFilterRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleUpdateFilterRow = (id, key, val) => {
    setFilterRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: val } : r))
    )
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      active: true,
      logic: combineLogic,
      rows: filterRows.filter((r) => r.value && r.value.trim() !== ''),
    })
    setCurrentPage(1)
    showToast('Kriteria filter berhasil diterapkan.')
  }

  const handleResetFilters = () => {
    setFilterRows([
      {
        id: 1,
        field: 'Judul Buku',
        value: '',
      },
    ])
    setAppliedFilters({
      active: false,
      logic: 'dan',
      rows: [],
    })
    setSelectedCategory('all')
    setCurrentPage(1)
    showToast('Filter direset ke kondisi awal.', 'info')
  }

  // Filter Items against category & applied filter builder rows
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter (from clicking 4 metric cards)
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      // If no builder filters active, return true
      if (!appliedFilters.active || appliedFilters.rows.length === 0) {
        return true
      }

      const matchRow = (row) => {
        const query = (row.value || '').toLowerCase().trim()
        if (!query) return true

        let targetVal = ''
        switch (row.field) {
          case 'Judul Buku':
            targetVal = item.title || ''
            break
          case 'Alasan Karantina':
            targetVal = item.quarantine_reason || ''
            break
          case 'Pengarang':
            targetVal = item.author || ''
            break
          case 'BIBID':
            targetVal = item.bibid || ''
            break
          case 'ISBN':
            targetVal = item.isbn || ''
            break
          case 'Subjek':
            targetVal = item.subject || ''
            break
          case 'Penerbit':
            targetVal = item.publisher || ''
            break
          case 'Edisi':
            targetVal = item.edition || ''
            break
          default:
            targetVal = `${item.title} ${item.author} ${item.quarantine_reason}`
        }

        targetVal = targetVal.toLowerCase()
        return targetVal.includes(query)
      }

      if (appliedFilters.logic === 'dan') {
        return appliedFilters.rows.every(matchRow)
      } else {
        return appliedFilters.rows.some(matchRow)
      }
    })
  }, [items, selectedCategory, appliedFilters])

  // Pagination calculation
  const totalRecords = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage))
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredItems.slice(start, start + perPage)
  }, [filteredItems, currentPage, perPage])

  // Select all checkbox handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedItems.map((i) => i.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Action Bar: Execute Bulk Action
  const handleExecuteBulkAction = async () => {
    if (selectedIds.length === 0) {
      showToast('Pilih minimal 1 rekaman katalog untuk diproses.', 'error')
      return
    }

    if (!bulkAction) {
      showToast('Pilih tindakan yang ingin dijalankan.', 'error')
      return
    }

    if (bulkAction === 'restore') {
      if (selectedIds.length === 1) {
        const singleItem = items.find((i) => i.id === selectedIds[0])
        if (singleItem) {
          handleOpenPublishModal(singleItem)
          return
        }
      }
      // Bulk restore
      try {
        const targetCatIds = selectedIds.map((id) => {
          const it = items.find((i) => i.id === id)
          return it?.db_id || id
        })
        await bulkRestoreQuarantineCatalogs(targetCatIds)
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)))
        setSelectedIds([])
        setBulkAction('')
        showToast(`${targetCatIds.length} katalog berhasil dipulihkan ke OPAC Publik!`)
        loadQuarantineData()
      } catch (err) {
        showToast('Gagal memulihkan massal: ' + (err.message || 'Error'), 'error')
      }
    } else if (bulkAction === 'delete') {
      const selectedObjects = items.filter((i) => selectedIds.includes(i.id))
      setBulkItemsToDelete(selectedObjects)
      return
    } else if (bulkAction === 'validate') {
      const firstSelected = items.find((i) => i.id === selectedIds[0])
      if (firstSelected) {
        setSelectedItemForValidasi(firstSelected)
      }
    } else if (bulkAction === 'merge') {
      const firstDuplicate = items.find(
        (i) => selectedIds.includes(i.id) && i.category === 'duplikasi'
      )
      if (firstDuplicate) {
        setSelectedItemForMerge(firstDuplicate)
      } else {
        showToast('Pilih katalog berstatus duplikasi untuk di-merge.', 'error')
      }
    } else {
      showToast(`Tindakan massal "${bulkAction}" berhasil dijalankan.`)
      setSelectedIds([])
      setBulkAction('')
    }
  }

  // Single Item Action Handlers: Up ke OPAC Publik
  const handleOpenPublishModal = (item) => {
    setSelectedItemForPublish(item)
  }

  const handleConfirmPublish = async ({ item, ddc, call_number, release_notes }) => {
    try {
      const catId = item.db_id || item.id
      if (catId) {
        await restoreQuarantineCatalog(catId, {
          ddc_number: ddc || item.ddc || '',
          catalog_call_number: call_number || item.call_number || '',
          abstract: release_notes || item.notes || '',
        })
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setSelectedIds((prev) => prev.filter((id) => id !== item.id))
      setSelectedItemForPublish(null)

      showToast(
        `Katalog "${item.title}" (${item.bibid}) berhasil diterbitkan ke OPAC Publik! Status eksemplar kini Aktif di Rak.`
      )
      loadQuarantineData()
    } catch (err) {
      console.error('Publish to OPAC error:', err)
      showToast(`Gagal menerbitkan ke OPAC: ${err.message || 'Error server'}`, 'error')
    }
  }

  const handleSaveValidasi = async (updatedItem) => {
    try {
      const catId = updatedItem.db_id || updatedItem.id
      if (catId) {
        await validateAndSaveCatalog(catId, {
          ddc_number: updatedItem.ddc,
          catalog_call_number: updatedItem.call_number,
          abstract: updatedItem.notes,
        })
      }
      setItems((prev) => prev.filter((i) => i.id !== updatedItem.id))
      setSelectedItemForValidasi(null)
      showToast(
        `Katalog ${updatedItem.bibid} berhasil divalidasi dan diterbitkan ke OPAC!`
      )
      loadQuarantineData()
    } catch (err) {
      console.error('Validasi error:', err)
      showToast(`Gagal memvalidasi katalog: ${err.message || 'Error server'}`, 'error')
    }
  }

  const handleConfirmMerge = (item, targetBibid, transferExemplars) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setSelectedItemForMerge(null)
    showToast(
      `Eksemplar ${item.bibid} berhasil digabungkan ke master ${targetBibid}.`
    )
  }

  const handleRequestDeleteItem = (item) => {
    setSelectedItemForDelete(item)
  }

  const handleConfirmDelete = async () => {
    if (!selectedItemForDelete) return
    setIsDeleting(true)
    const item = selectedItemForDelete
    try {
      const catId = item.db_id || item.id
      if (catId) {
        await deleteAdminCatalog(catId)
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setSelectedIds((prev) => prev.filter((id) => id !== item.id))
      setSelectedItemForDelete(null)
      setSelectedItemForDetail(null)
      showToast(`Katalog "${item.title}" berhasil dihapus permanen dari sistem.`, 'info')
      loadQuarantineData()
    } catch (err) {
      console.error('Delete catalog error:', err)
      showToast(`Gagal menghapus katalog: ${err.message || 'Error server'}`, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkItemsToDelete || bulkItemsToDelete.length === 0) return
    setIsDeleting(true)
    const itemsToDelete = bulkItemsToDelete
    const idsToDelete = itemsToDelete.map((i) => i.id)
    try {
      const catIds = itemsToDelete.map((it) => it.db_id || it.id)
      await bulkDeleteQuarantineCatalogs(catIds)
      setItems((prev) => prev.filter((i) => !idsToDelete.includes(i.id)))
      setSelectedIds([])
      setBulkAction('')
      setBulkItemsToDelete(null)
      showToast(
        `${itemsToDelete.length} rekaman berhasil dihapus permanen dari sistem.`,
        'info'
      )
      loadQuarantineData()
    } catch (err) {
      console.error('Bulk delete error:', err)
      showToast('Gagal menghapus massal: ' + (err.message || 'Error server'), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Quick export action
  const handleExport = (format = 'excel') => {
    showToast(
      `Mengekspor ${filteredItems.length} rekaman karantina ke format ${format.toUpperCase()}...`
    )
  }

  return (
    <AdminLayout>
      {/* Toast Notification Container */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : toast.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : toast.type === 'info' ? (
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="space-y-5 pb-12">
        {/* ========================================================= */}
        {/* TOP PAGE HEADER: Title, Subtitle, & Top Right Actions     */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-black text-[#0B2256] tracking-tight">
              Karantina Katalog
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl mt-1 leading-relaxed">
              Daftar rekaman katalog bibliografis yang ditangguhkan, belum diverifikasi, atau dihapus sementara dari peredaran OPAC publik dan layanan sirkulasi perpustakaan daerah.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start">
            {/* Segarkan Data button */}
            <button
              type="button"
              onClick={loadQuarantineData}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <RotateCw
                className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Segarkan Data</span>
            </button>

            {/* Help (?) button */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 flex items-center justify-center shadow-2xs transition-all cursor-pointer active:scale-95"
              aria-label="Bantuan & SOP Karantina"
              title="Panduan Operasional Karantina"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DYNAMIC MULTI-CONDITION FILTER BUILDER CONTAINER          */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F6FA] border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Header Line: Logika Penggabungan & Tambah filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">
                Logika Penggabungan:
              </span>

              {/* Dan / Atau Toggle Pill */}
              <div className="inline-flex rounded-md p-0.5 bg-slate-200/70 border border-slate-300/60">
                <button
                  type="button"
                  onClick={() => setCombineLogic('dan')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    combineLogic === 'dan'
                      ? 'bg-[#0B2256] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dan
                </button>
                <button
                  type="button"
                  onClick={() => setCombineLogic('atau')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    combineLogic === 'atau'
                      ? 'bg-[#0B2256] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Atau
                </button>
              </div>

              <span className="text-[11px] text-slate-500 italic hidden sm:inline ml-1">
                {combineLogic === 'dan'
                  ? '(Semua kondisi bernilai benar)'
                  : '(Salah satu kondisi bernilai benar)'}
              </span>
            </div>

            {/* + Tambah filter button in filter bar */}
            <button
              type="button"
              onClick={handleAddFilterRow}
              className="px-3 py-1.5 rounded-lg bg-[#00635A] hover:bg-[#005048] text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah filter</span>
            </button>
          </div>

          {/* Dynamic Condition Rows */}
          <div className="space-y-2.5">
            {filterRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
              >
                {/* Field Selector */}
                <div className="md:col-span-4">
                  <select
                    value={row.field}
                    onChange={(e) =>
                      handleUpdateFilterRow(row.id, 'field', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] cursor-pointer"
                  >
                    <option value="Judul Buku">Judul Buku</option>
                    <option value="Alasan Karantina">Alasan Karantina</option>
                    <option value="Pengarang">Pengarang</option>
                    <option value="BIBID">BIBID</option>
                    <option value="ISBN">ISBN</option>
                    <option value="Subjek">Subjek / Topik</option>
                    <option value="Penerbit">Penerbit</option>
                    <option value="Edisi">Edisi</option>
                  </select>
                </div>

                {/* Query Value Input */}
                <div className="md:col-span-6">
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) =>
                      handleUpdateFilterRow(row.id, 'value', e.target.value)
                    }
                    placeholder="Masukkan kata kunci filter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyFilters()
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B2256]"
                  />
                </div>

                {/* Hapus Row Button */}
                <div className="md:col-span-2 flex justify-start md:justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveFilterRow(row.id)}
                    className="w-full md:w-auto px-3 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Filter Buttons: Ulangi & Cari Data */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Ulangi</span>
            </button>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-5 py-2 rounded-lg bg-[#0B2256] hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Data</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ACTION BAR: Bulk Action Select, Process, View Options     */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Left: Bulk Action Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Aksi :
            </span>

            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] min-w-[210px] cursor-pointer"
            >
              <option value="">-- Pilih Tindakan --</option>
              <option value="restore">Pulihkan ke Katalog Aktif (OPAC)</option>
              <option value="validate">Verifikasi &amp; Lengkapi Data</option>
              <option value="merge">Gabung / Merge Duplikat</option>
              <option value="delete">Hapus Permanen Dari Sistem</option>
            </select>

            <button
              type="button"
              onClick={handleExecuteBulkAction}
              className="px-4 py-1.5 rounded-lg bg-[#0B2256] hover:bg-blue-950 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Proses</span>
            </button>
          </div>

          {/* Right: Per-Page Dropdown & View Mode Switchers */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 whitespace-nowrap">
                Tampilkan :
              </span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#0B2256] cursor-pointer"
              >
                <option value={5}>5 per halaman</option>
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
                <option value={50}>50 per halaman</option>
              </select>
            </div>

            {/* View Icons (Table, Grid, Sheet) */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-[#0B2256] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel"
              >
                <Columns3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-[#0B2256] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleExport('excel')}
                className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Ekspor Laporan (Excel / CSV)"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABLE SECTION / CARD SECTION                             */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Table Header Banner */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Columns3 className="w-4 h-4 text-[#0B2256]" />
              <h2 className="text-xs font-bold text-[#0B2256] tracking-wider uppercase">
                DAFTAR REKAMAN TERTAHAN DI KARANTINA
              </h2>
            </div>

            {selectedIds.length > 0 && (
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                {selectedIds.length} rekaman dipilih
              </span>
            )}
          </div>

          {/* Conditional: Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedItems.length > 0 &&
                          selectedIds.length === paginatedItems.length
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded text-[#0B2256] border-slate-300 focus:ring-[#0B2256] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-20 text-center">IS RDA</th>
                    <th className="py-3 px-3 w-28">BIBID</th>
                    <th className="py-3 px-4 min-w-[280px]">JUDUL &amp; PENGARANG</th>
                    <th className="py-3 px-3 w-28">EDISI</th>
                    <th className="py-3 px-4 min-w-[190px]">PENERBITAN / PUBLIKASI</th>
                    <th className="py-3 px-4 min-w-[160px]">DESKRIPSI FISIK</th>
                    <th className="py-3 px-4 w-32">SUBJEK</th>
                    <th className="py-3 px-3 w-24 text-center">AKSI</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <Archive className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">
                          Tidak ada rekaman tertahan yang cocok dengan kriteria filter.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-2 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Reset Filter &amp; Tampilkan Semua
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, index) => {
                      const isSelected = selectedIds.includes(item.id)
                      const rowNumber = (currentPage - 1) * perPage + index + 1

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleRow(item.id)}
                              className="w-4 h-4 rounded text-[#0B2256] border-slate-300 focus:ring-[#0B2256] cursor-pointer"
                            />
                          </td>

                          {/* Row Number */}
                          <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                            {rowNumber}
                          </td>

                          {/* IS RDA Badge */}
                          <td className="py-3.5 px-3 text-center">
                            {item.is_rda ? (
                              <span className="inline-block px-2.5 py-0.5 rounded bg-[#C7F3DE] text-[#065F46] font-bold text-[10.5px]">
                                Ya
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded bg-[#E2E8F0] text-[#334155] font-medium text-[10.5px]">
                                Tidak
                              </span>
                            )}
                          </td>

                          {/* BIBID Monospace */}
                          <td className="py-3.5 px-3">
                            <span className="font-mono font-bold text-xs text-[#0B2256] whitespace-nowrap">
                              {item.bibid.replace('-', ' - ')}
                            </span>
                          </td>

                          {/* Judul & Pengarang */}
                          <td className="py-3.5 px-4">
                            <div
                              onClick={() => setSelectedItemForDetail(item)}
                              className="font-bold text-sm text-[#0B2256] hover:underline cursor-pointer leading-snug"
                            >
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.author}</span>
                            </div>
                            {item.barcode_no && (
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10.5px] font-bold">
                                  {item.barcode_no}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10.5px] font-semibold border border-rose-200">
                                  Kondisi: {item.physical_condition || 'Rusak'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Edisi */}
                          <td className="py-3.5 px-3 text-slate-600 text-xs">
                            {item.edition || '-'}
                          </td>

                          {/* Penerbitan / Publikasi */}
                          <td className="py-3.5 px-4 text-slate-700 text-xs">
                            <div className="font-medium">{item.publisher}</div>
                            <div className="text-[11px] text-slate-400">
                              {item.publish_year}
                            </div>
                          </td>

                          {/* Deskripsi Fisik */}
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {item.physical_description}
                          </td>

                          {/* Subjek / Alasan */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                              {item.subject}
                            </span>
                          </td>

                          {/* Aksi Cepat */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Detail */}
                              <button
                                type="button"
                                onClick={() => setSelectedItemForDetail(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#0B2256] transition-colors cursor-pointer"
                                title="Lihat Detail Katalog"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit & Lengkapi Data */}
                              <button
                                type="button"
                                onClick={() => setSelectedItemForValidasi(item)}
                                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                                title="Edit &amp; Lengkapi Data (DDC)"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Terbitkan ke OPAC Publik */}
                              <button
                                type="button"
                                onClick={() => handleOpenPublishModal(item)}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                title="Terbitkan ke OPAC Publik"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              {/* Hapus Permanen */}
                              <button
                                type="button"
                                onClick={() => handleRequestDeleteItem(item)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Hapus Permanen dari Sistem"
                              >
                                <Trash2 className="w-4 h-4" />
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
          )}

          {/* Conditional: Card/Grid View */}
          {viewMode === 'grid' && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-[#0B2256]">
                        {item.bibid}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.is_rda
                            ? 'bg-[#C7F3DE] text-[#065F46]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        RDA: {item.is_rda ? 'Ya' : 'Tidak'}
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedItemForDetail(item)}
                      className="font-bold text-sm text-[#0B2256] hover:underline cursor-pointer line-clamp-2"
                    >
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{item.author}</span>
                    </p>

                    <div className="mt-2.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                      ⚠️ {item.quarantine_reason}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {item.publisher}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedItemForDetail(item)}
                      className="text-xs text-[#0B2256] font-bold hover:underline"
                    >
                      Kelola &gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================= */}
          {/* PAGINATION FOOTER: Counts, Refresh, & Controls            */}
          {/* ========================================================= */}
          <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Summary text & Segarkan Kembali */}
            <div className="flex items-center gap-3 text-slate-600">
              <span>
                Menampilkan{' '}
                <strong>
                  {totalRecords === 0
                    ? 0
                    : `${(currentPage - 1) * perPage + 1} – ${Math.min(
                        currentPage * perPage,
                        totalRecords
                      )}`}
                </strong>{' '}
                dari <strong>{totalRecords}</strong> rekaman katalog karantina
              </span>

              <button
                type="button"
                onClick={loadQuarantineData}
                className="text-slate-700 hover:text-[#0B2256] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 text-slate-400 ${
                    loading ? 'animate-spin' : ''
                  }`}
                />
                <span>Segarkan Kembali</span>
              </button>
            </div>

            {/* Right: Pagination buttons (< Sebelumnya, 1, 2, 3, ..., 4265, Selanjutnya >) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-40 disabled:hover:bg-transparent font-medium cursor-pointer transition-colors"
              >
                &lt; Sebelumnya
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === 1
                    ? 'bg-[#0B2256] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                1
              </button>

              {totalPages >= 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === 2
                      ? 'bg-[#0B2256] text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  2
                </button>
              )}

              {totalPages >= 3 && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(3)}
                  className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === 3
                      ? 'bg-[#0B2256] text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  3
                </button>
              )}

              {/* Ellipsis & Highest page sample from screenshot */}
              <span className="px-1 text-slate-400">...</span>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages > 3 ? totalPages : 4)}
                className={`px-2 h-7 rounded-md font-medium text-xs flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === (totalPages > 3 ? totalPages : 4)
                    ? 'bg-[#0B2256] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                4265
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-md font-semibold disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                Selanjutnya &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DIALOGS                                            */}
      {/* ========================================================= */}
      <DetailModal
        isOpen={Boolean(selectedItemForDetail)}
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onRestore={handleOpenPublishModal}
        onValidate={(item) => setSelectedItemForValidasi(item)}
        onMerge={(item) => setSelectedItemForMerge(item)}
        onDelete={handleRequestDeleteItem}
      />

      <ValidasiModal
        isOpen={Boolean(selectedItemForValidasi)}
        item={selectedItemForValidasi}
        onClose={() => setSelectedItemForValidasi(null)}
        onSave={handleSaveValidasi}
      />

      <MergeModal
        isOpen={Boolean(selectedItemForMerge)}
        item={selectedItemForMerge}
        onClose={() => setSelectedItemForMerge(null)}
        onConfirmMerge={handleConfirmMerge}
      />

      <PublishOpacModal
        isOpen={Boolean(selectedItemForPublish)}
        item={selectedItemForPublish}
        onClose={() => setSelectedItemForPublish(null)}
        onConfirmPublish={handleConfirmPublish}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <DeleteConfirmModal
        isOpen={Boolean(selectedItemForDelete) || Boolean(bulkItemsToDelete)}
        item={selectedItemForDelete}
        items={bulkItemsToDelete || []}
        isLoading={isDeleting}
        onClose={() => {
          setSelectedItemForDelete(null)
          setBulkItemsToDelete(null)
        }}
        onConfirm={
          selectedItemForDelete ? handleConfirmDelete : handleConfirmBulkDelete
        }
      />
    </AdminLayout>
  )
}
