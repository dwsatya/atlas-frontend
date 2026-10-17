import { useState, useRef, useEffect } from 'react'
import {
  Save,
  Copy,
  CheckCircle2,
  Bookmark,
  BookOpen,
  ArrowUpDown,
  Plus,
  Trash2,
  Check,
  Globe,
  Upload,
  Camera,
  HelpCircle,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
  ChevronDown,
  Barcode,
  Layers,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import Marc21Modal from './Marc21Modal'
import ImportExcelModal from './ImportExcelModal'
import CopyCatalogModal from './CopyCatalogModal'

export default function AdminEntriKatalog() {
  // Modal states
  const [isMarcModalOpen, setIsMarcModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)

  // Toast feedback state
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Cover Image
  const [coverImage, setCoverImage] = useState(null)
  const fileInputRef = useRef(null)

  // Form State matching the visual layout exactly
  const [formData, setFormData] = useState({
    // Header selection
    materialType: 'Monograf (Buku, Jurnal, Laporan, dll)',

    // Card 1: Judul & Penanggung Jawab (Empty by default to show placeholders as in attachment)
    title: '',
    prefixWord: '-- Tidak diawali --',
    subtitle: '',
    statementOfResponsibility: '',

    // Card 2: Tajuk Pengarang Utama
    mainAuthorCategory: 'Nama Orang',
    mainAuthor: '',
    mainAuthorType: 'Nama Depan', // 'Nama Depan' | 'Nama Belakang' | 'Nama Keluarga' | 'Tdk Ada Info Tambahan'

    // Pengarang Tambahan list
    additionalAuthors: [
      {
        id: 1,
        category: 'Nama Orang',
        name: '',
        type: 'Nama Depan',
      },
    ],

    // Card 3: Penerbitan (Impresum)
    publishCity: 'Singaraja',
    publisher: 'Erlangga',
    publishYear: '2026',

    // Card 4: Deskripsi Fisik (Kolasi)
    pages: 'xxiv, 312 hlm.',
    illustrations: 'ilus. , tabel, foto',
    dimension: '24 cm',
    accompanyingMaterial: '-',

    // Card 5: Subjek & Klasifikasi Perpustakaan
    edition: 'Cetakan ke-2 (Revisi Lengkap)',
    subjects: [
      {
        id: 1,
        category: 'Nama Orang',
        name: '-',
        type: 'Tdk Ada Info Tambahan', // 'Tdk Ada Info Tambahan' | 'Nama Depan' | 'Nama Belakang' | 'Nama Keluarga'
      },
    ],
    ddcNumber: '-',
    callNumber: '-',
    isbn: '978-623-789-812-4',

    // Card 6: Catatan & Abstrak (Notes)
    noteType: 'Abstrak / Anotasi',
    notes:
      'Buku ini menyajikan telaah mendalam mengenai kerangka epistemologis studi Islam kontemporer yang relevan bagi santri dan akademisi madrasah. Dilengkapi dengan pedoman riset digital, studi naskah keagamaan, serta integrasi sains modern dengan khazanah turats pesantren.',

    // Card 7: Lokasi Koleksi Daring / E-Resource
    eResourceUrl: 'https://example.com',

    // Right Column: Karakteristik Dokumen
    language: 'ind - Bahasa Indonesia',
    literaryForm: '0 - Bukan fiksi atau tidak didefinisikan',
    audience: 'Tidak diketahui',

    // Right Column: Penayangan & Visibilitas
    showInOpac: true,
    isQuarantine: false,

    // Metadata
    authorAdmin: 'Ridwan Surasta',
    createdAtFormatted: '16/09/2026 14:18',
    status: 'Draft Siap Eksemplar',
  })

  // Autosave timer simulation
  const [lastSavedMinutes, setLastSavedMinutes] = useState(1)
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSavedMinutes((m) => (m >= 10 ? 1 : m + 1))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Input change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Cover image handlers
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal 2 MB!', 'error')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setCoverImage(reader.result)
        showToast('Sampul monograf berhasil dimuat!')
      }
      reader.readAsDataURL(file)
    }
  }

  // Author management
  const addAdditionalAuthor = () => {
    const newAuthor = {
      id: Date.now(),
      category: 'Nama Orang',
      name: '',
      type: 'Nama Depan',
    }
    setFormData((prev) => ({
      ...prev,
      additionalAuthors: [...prev.additionalAuthors, newAuthor],
    }))
    showToast('Kolom pengarang tambahan ditambahkan')
  }

  const removeAdditionalAuthor = (id) => {
    if (formData.additionalAuthors.length <= 1) {
      // Clear name if only 1 author row remains
      setFormData((prev) => ({
        ...prev,
        additionalAuthors: [{ id: 1, category: 'Nama Orang', name: '', type: 'Nama Depan' }],
      }))
      return
    }
    setFormData((prev) => ({
      ...prev,
      additionalAuthors: prev.additionalAuthors.filter((a) => a.id !== id),
    }))
    showToast('Pengarang tambahan dihapus')
  }

  const updateAdditionalAuthor = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      additionalAuthors: prev.additionalAuthors.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }))
  }

  // Subject management
  const addSubject = () => {
    const newSubject = {
      id: Date.now(),
      category: 'Nama Orang',
      name: '',
      type: 'Tdk Ada Info Tambahan',
    }
    setFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }))
    showToast('Kolom subjek baru ditambahkan')
  }

  const updateSubject = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }))
  }

  // Copy title to clipboard
  const handleCopyTitle = () => {
    if (!formData.title) {
      showToast('Judul masih kosong, belum ada teks untuk disalin', 'error')
      return
    }
    navigator.clipboard.writeText(formData.title)
    showToast(`Judul "${formData.title}" berhasil disalin ke papan klip!`)
  }

  // Generate Call Number
  const handleGenerateCallNumber = () => {
    const ddc = formData.ddcNumber !== '-' ? formData.ddcNumber : '297.01'
    const authorCode = formData.mainAuthor ? formData.mainAuthor.slice(0, 3).toUpperCase() : 'SUR'
    const titleCode = formData.title ? formData.title.charAt(0).toLowerCase() : 'e'
    const generated = `${ddc} ${authorCode} ${titleCode}`

    setFormData((prev) => ({
      ...prev,
      ddcNumber: ddc,
      callNumber: generated,
    }))
    showToast(`No. Panggil otomatis dibuat: ${generated}`)
  }

  // Save Catalog Handler
  const handleSaveCatalog = () => {
    if (!formData.title.trim()) {
      showToast('Judul Utama wajib diisi sebelum menyimpan!', 'error')
      return
    }

    localStorage.setItem('atlas_last_catalog_entry', JSON.stringify(formData))
    setLastSavedMinutes(0)
    showToast('Katalog berhasil disimpan ke database!', 'success')
  }

  // Complete / Selesai Handler
  const handleFinish = () => {
    handleSaveCatalog()
    showToast('Penyusunan Entri Katalog selesai dan siap dieksemplarkan!', 'success')
  }

  // Import success callback
  const handleImportSuccess = (importedData) => {
    setFormData((prev) => ({
      ...prev,
      ...importedData,
    }))
    showToast('Metadata berhasil diimpor ke formulir!')
  }

  // Copy from another catalog callback
  const handleSelectCopyCatalog = (catalog) => {
    setFormData((prev) => ({
      ...prev,
      title: catalog.title,
      subtitle: catalog.subtitle || '',
      statementOfResponsibility: catalog.statementOfResponsibility || '',
      mainAuthor: catalog.mainAuthor || '',
      publisher: catalog.publisher || '',
      publishCity: catalog.publishCity || '',
      publishYear: catalog.publishYear || '',
      edition: catalog.edition || '',
      pages: catalog.pages || '',
      dimension: catalog.dimension || '',
      isbn: catalog.isbn || '',
      ddcNumber: catalog.ddcNumber || '-',
      callNumber: catalog.callNumber || '-',
      notes: catalog.notes || '',
    }))
    showToast(`Data katalog "${catalog.title}" berhasil disalin!`)
  }

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

      {/* Main Page Container */}
      <div className="space-y-4">
        {/* Top Header Actions (Title & Import / MARC buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B2256] tracking-tight">
            Entri Katalog
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Impor Excel / RDA */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0B2256] hover:bg-[#08183c] text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-2xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Impor Excel / RDA</span>
            </button>

            {/* Tampilkan Form MARC 21 */}
            <button
              onClick={() => setIsMarcModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <FileCode className="w-4 h-4" />
              <span>Tampilkan Form MARC 21</span>
            </button>

            {/* Help Button */}
            <button
              onClick={() =>
                alert(
                  'Bantuan Entri Katalog:\n- Isi formulir sesuai pedoman RDA.\n- Gunakan tombol MARC 21 untuk melihat pemetaan tag perpustakaan.\n- Simpan draf sewaktu-waktu.'
                )
              }
              className="w-7.5 h-7.5 rounded-full border border-slate-300 text-blue-600 hover:text-blue-800 hover:bg-white flex items-center justify-center transition cursor-pointer shadow-2xs text-xs font-bold"
              title="Bantuan Entri Katalog"
            >
              <HelpCircle className="w-4 h-4 text-[#2563EB]" />
            </button>
          </div>
        </div>

        {/* Quick Action Ribbon Bar (Simpan, Salin Judul, Salin Katalog, Selesai, Jenis Bahan) */}
        <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Simpan */}
            <button
              onClick={handleSaveCatalog}
              className="px-3.5 py-1.5 bg-[#007A64] hover:bg-[#006452] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>

            {/* Salin Judul */}
            <button
              onClick={handleCopyTitle}
              className="px-3 py-1.5 bg-[#EEF4FF] hover:bg-blue-100 text-[#2563EB] border border-[#BFDBFE] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Judul</span>
            </button>

            {/* Salin Katalog dari... */}
            <button
              onClick={() => setIsCopyModalOpen(true)}
              className="px-3 py-1.5 bg-[#EEF4FF] hover:bg-blue-100 text-[#2563EB] border border-[#BFDBFE] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Katalog dari...</span>
            </button>

            {/* Selesai */}
            <button
              onClick={handleFinish}
              className="px-3 py-1.5 bg-[#FEF3EB] hover:bg-amber-100 text-[#D97706] border border-[#FED7AA] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai</span>
            </button>
          </div>

          {/* Right Selector: Jenis Bahan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              Jenis Bahan:
            </span>

            <div className="relative">
              <select
                value={formData.materialType}
                onChange={(e) => handleInputChange('materialType', e.target.value)}
                className="appearance-none bg-[#F0F4FA] border border-slate-200/80 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="Monograf (Buku, Jurnal, Laporan, dll)">
                  Monograf (Buku, Jurnal, Laporan, dll)
                </option>
                <option value="Serial (Majalah, Koran, Buletin)">
                  Serial (Majalah, Koran, Buletin)
                </option>
                <option value="Bahan Kartografi (Peta, Atlas, Bola Dunia)">
                  Bahan Kartografi (Peta, Atlas, Bola Dunia)
                </option>
                <option value="Koleksi Naskah / Manuskrip Kuno">
                  Koleksi Naskah / Manuskrip Kuno
                </option>
                <option value="Rekaman Suara & Musik">
                  Rekaman Suara &amp; Musik
                </option>
                <option value="Bentuk Mikro & Sumber Elektronik">
                  Bentuk Mikro &amp; Sumber Elektronik
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Two-Column Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN (approx 68% / 8 cols on large screens)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4">
            {/* Card 1: Judul & Penanggung Jawab */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0B2256]">
                  Judul &amp; Penanggung Jawab
                </h2>
                <span className="text-[11px] font-medium text-red-500">
                  * Bidang wajib diisi
                </span>
              </div>

              {/* Row 1: Judul Utama + Diawali Kata Sandang */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Judul Utama <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Masukan judul utama"
                      className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition pr-9"
                    />
                    <button
                      type="button"
                      onClick={handleCopyTitle}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition p-1"
                      title="Salin judul"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Diawali Kata Sandang
                  </label>
                  <div className="relative">
                    <select
                      value={formData.prefixWord}
                      onChange={(e) => handleInputChange('prefixWord', e.target.value)}
                      className="w-full appearance-none bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer pr-8"
                    >
                      <option value="-- Tidak diawali --">-- Tidak diawali --</option>
                      <option value="The">The</option>
                      <option value="A">A</option>
                      <option value="An">An</option>
                      <option value="Sang">Sang</option>
                      <option value="Si">Si</option>
                      <option value="Yang">Yang</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Anak Judul (Sub Judul) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Anak Judul (Sub Judul)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Masukan anak judul"
                  className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* Row 3: Penanggung Jawab */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Penanggung Jawab (Pernyataan Tanggung Jawab / Statement of Responsibility)
                </label>
                <input
                  type="text"
                  value={formData.statementOfResponsibility}
                  onChange={(e) =>
                    handleInputChange('statementOfResponsibility', e.target.value)
                  }
                  placeholder="Masukan penanggung jawab"
                  className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <p className="text-[11px] text-slate-400">
                  Sesuai yang tertera pada halaman judul monograf.
                </p>
              </div>
            </div>

            {/* Card 2: Tajuk Pengarang (Author) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Tajuk Pengarang (Author)
              </h2>

              {/* Sub-Card 1: Tajuk Pengarang Utama */}
              <div className="bg-[#F0F4FA] rounded-xl p-3.5 space-y-2.5 border border-slate-200/60">
                <span className="text-xs font-bold text-[#0B2256] block">
                  Tajuk Pengarang Utama
                </span>

                {/* Input row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4 relative">
                    <select
                      value={formData.mainAuthorCategory}
                      onChange={(e) =>
                        handleInputChange('mainAuthorCategory', e.target.value)
                      }
                      className="w-full appearance-none bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8"
                    >
                      <option value="Nama Orang">Nama Orang</option>
                      <option value="Badan Korporasi">Badan Korporasi</option>
                      <option value="Pertemuan / Konferensi">Pertemuan / Konferensi</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="sm:col-span-8 flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.mainAuthor}
                      onChange={(e) => handleInputChange('mainAuthor', e.target.value)}
                      placeholder="Masukan nama pengarang utama"
                      className="flex-1 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => showToast('Diurutkan berdasarkan indeks kepengarangan')}
                      className="p-1.5 bg-[#EEF4FF] hover:bg-blue-100 text-[#2563EB] border border-[#BFDBFE] rounded-lg transition shrink-0 cursor-pointer"
                      title="Urutkan"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Radio buttons row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-700">
                  {['Nama Depan', 'Nama Belakang', 'Nama Keluarga', 'Tdk Ada Info Tambahan'].map(
                    (option) => (
                      <label
                        key={option}
                        className="inline-flex items-center gap-1.5 cursor-pointer font-normal hover:text-blue-700 whitespace-nowrap"
                      >
                        <input
                          type="radio"
                          name="mainAuthorType"
                          value={option}
                          checked={formData.mainAuthorType === option}
                          onChange={(e) =>
                            handleInputChange('mainAuthorType', e.target.value)
                          }
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Sub-Card 2: Tajuk Pengarang Tambahan */}
              {formData.additionalAuthors.map((author, index) => (
                <div
                  key={author.id}
                  className="bg-[#F0F4FA] rounded-xl p-3.5 space-y-2.5 border border-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B2256]">
                      Tajuk Pengarang Tambahan {index > 0 ? `#${index + 1}` : ''}
                    </span>

                    {index === 0 && (
                      <button
                        type="button"
                        onClick={addAdditionalAuthor}
                        className="text-xs font-bold text-[#00A389] hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Pengarang</span>
                      </button>
                    )}
                  </div>

                  {/* Input row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4 relative">
                      <select
                        value={author.category}
                        onChange={(e) =>
                          updateAdditionalAuthor(author.id, 'category', e.target.value)
                        }
                        className="w-full appearance-none bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8"
                      >
                        <option value="Nama Orang">Nama Orang</option>
                        <option value="Badan Korporasi">Badan Korporasi</option>
                        <option value="Pertemuan / Konferensi">Pertemuan / Konferensi</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="sm:col-span-8 flex items-center gap-2">
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e) =>
                          updateAdditionalAuthor(author.id, 'name', e.target.value)
                        }
                        placeholder="Masukan nama pengarang tambahan"
                        className="flex-1 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalAuthor(author.id)}
                        className="p-1.5 bg-[#FEE2E2] hover:bg-red-200 text-red-600 rounded-lg transition shrink-0 cursor-pointer"
                        title="Hapus pengarang tambahan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Radio buttons row */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-700">
                    {['Nama Depan', 'Nama Belakang', 'Nama Keluarga'].map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center gap-1.5 cursor-pointer font-normal hover:text-blue-700"
                      >
                        <input
                          type="radio"
                          name={`authorType_${author.id}`}
                          value={option}
                          checked={author.type === option}
                          onChange={(e) =>
                            updateAdditionalAuthor(author.id, 'type', e.target.value)
                          }
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Card 3: Penerbitan (Impresum) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Penerbitan (Impresum)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Tempat Terbit
                  </label>
                  <input
                    type="text"
                    value={formData.publishCity}
                    onChange={(e) => handleInputChange('publishCity', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nama Penerbit
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => handleInputChange('publisher', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Tahun Terbit
                  </label>
                  <input
                    type="text"
                    value={formData.publishYear}
                    onChange={(e) => handleInputChange('publishYear', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Deskripsi Fisik (Kolasi) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Deskripsi Fisik (Kolasi)
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Jumlah Halaman
                  </label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) => handleInputChange('pages', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Ket. Ilustrasi
                  </label>
                  <input
                    type="text"
                    value={formData.illustrations}
                    onChange={(e) => handleInputChange('illustrations', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Dimensi (Tinggi)
                  </label>
                  <input
                    type="text"
                    value={formData.dimension}
                    onChange={(e) => handleInputChange('dimension', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Bahan Sertaan
                  </label>
                  <input
                    type="text"
                    value={formData.accompanyingMaterial}
                    onChange={(e) =>
                      handleInputChange('accompanyingMaterial', e.target.value)
                    }
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 5: Subjek & Klasifikasi Perpustakaan */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Subjek &amp; Klasifikasi Perpustakaan
              </h2>

              {/* Edisi / Cetakan */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Edisi / Cetakan
                </label>
                <input
                  type="text"
                  value={formData.edition}
                  onChange={(e) => handleInputChange('edition', e.target.value)}
                  className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Sub-card Tajuk Subjek / Topik */}
              {formData.subjects.map((sub, sIdx) => (
                <div
                  key={sub.id}
                  className="bg-[#F0F4FA] rounded-xl p-3.5 space-y-2.5 border border-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B2256]">
                      Tajuk Subjek / Topik {sIdx > 0 ? `#${sIdx + 1}` : ''}
                    </span>

                    {sIdx === 0 && (
                      <button
                        type="button"
                        onClick={addSubject}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Subjek Lain</span>
                      </button>
                    )}
                  </div>

                  {/* Input row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4 relative">
                      <select
                        value={sub.category}
                        onChange={(e) =>
                          updateSubject(sub.id, 'category', e.target.value)
                        }
                        className="w-full appearance-none bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8"
                      >
                        <option value="Nama Orang">Nama Orang</option>
                        <option value="Topik / Subjek">Topik / Subjek</option>
                        <option value="Nama Geografis">Nama Geografis</option>
                        <option value="Bentuk / Genre">Bentuk / Genre</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="sm:col-span-8 flex items-center gap-2">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) =>
                          updateSubject(sub.id, 'name', e.target.value)
                        }
                        className="flex-1 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => showToast('Membuka perbendaharaan istilah subjek DDC / Sears')}
                        className="p-1.5 bg-[#0B2256] text-white hover:bg-blue-900 rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        title="Pilih Subjek Standar"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Radio buttons row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-700">
                    {[
                      'Tdk Ada Info Tambahan',
                      'Nama Depan',
                      'Nama Belakang',
                      'Nama Keluarga',
                    ].map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center gap-1.5 cursor-pointer font-normal hover:text-blue-700 whitespace-nowrap"
                      >
                        <input
                          type="radio"
                          name={`subjectType_${sub.id}`}
                          value={option}
                          checked={sub.type === option}
                          onChange={(e) =>
                            updateSubject(sub.id, 'type', e.target.value)
                          }
                          className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Row 3 fields: DDC, Call No, ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* No. Klas DDC */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    No. Klas DDC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ddcNumber}
                    onChange={(e) => handleInputChange('ddcNumber', e.target.value)}
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* No. Panggil (Call No) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    No. Panggil (Call No) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={formData.callNumber}
                      onChange={(e) => handleInputChange('callNumber', e.target.value)}
                      className="flex-1 min-w-0 bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCallNumber}
                      className="w-8.5 h-8.5 bg-[#007A64] hover:bg-[#006654] text-white rounded-lg transition shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Generate Nomor Panggil Otomatis"
                    >
                      <Barcode className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* ISBN / ISSN */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ISBN / ISSN
                  </label>
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange('isbn', e.target.value)}
                      className="flex-1 min-w-0 bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                    <div
                      className="w-8.5 h-8.5 bg-[#DCE9FE] text-[#1E40AF] rounded-lg shrink-0 flex items-center justify-center"
                      title="Format Terverifikasi"
                    >
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: Catatan & Abstrak (Notes) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Catatan &amp; Abstrak (Notes)
              </h2>

              {/* Radio tabs row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                {[
                  'Abstrak / Anotasi',
                  'Catatan Disertasi / Tesis',
                  'Catatan Bibliografi',
                  'Rincian Isi',
                  'Catatan Umum',
                ].map((nt) => (
                  <label
                    key={nt}
                    className="inline-flex items-center gap-1.5 cursor-pointer font-normal hover:text-blue-700"
                  >
                    <input
                      type="radio"
                      name="noteType"
                      value={nt}
                      checked={formData.noteType === nt}
                      onChange={(e) => handleInputChange('noteType', e.target.value)}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>{nt}</span>
                  </label>
                ))}
              </div>

              {/* Textarea container */}
              <div className="relative bg-[#F0F4FA] border border-slate-200/60 rounded-xl p-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Tuliskan catatan, anotasi ringkas, atau abstrak isi dokumen di sini..."
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-y leading-relaxed pr-8"
                />

                <button
                  type="button"
                  onClick={() => showToast('Menambahkan segmen catatan')}
                  className="absolute right-3 bottom-3 w-6 h-6 rounded-md bg-[#DCE9FE] hover:bg-blue-200 text-[#1E40AF] flex items-center justify-center font-bold text-xs transition cursor-pointer"
                  title="Tambah Catatan"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 7: Lokasi Koleksi Daring / E-Resource */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Lokasi Koleksi Daring / E-Resource
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={formData.eResourceUrl}
                    onChange={(e) => handleInputChange('eResourceUrl', e.target.value)}
                    placeholder="https://perpustakaan.bulelengkab.go.id/repo/..."
                    className="w-full bg-[#F0F4FA] border border-slate-200/60 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Tautan e-resource berhasil ditambahkan')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#007A64] hover:bg-[#006452] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (approx 32% / 4 cols on large screens)       */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Sampul Monograf */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0B2256]">
                  Sampul Monograf
                </h2>
                <span className="text-[10px] font-medium text-slate-500 border border-slate-200 px-2 py-0.5 rounded">
                  Rasio 3:4
                </span>
              </div>

              {/* Upload Drop Area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[3/4] w-full max-w-[210px] mx-auto bg-[#F0F4FA] rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer group transition-all border border-slate-200/60"
              >
                {coverImage ? (
                  <>
                    <img
                      src={coverImage}
                      alt="Sampul Monograf Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs font-bold">Ubah Gambar</span>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex flex-col items-center text-center">
                    <div className="bg-white shadow-2xs border border-slate-200/80 rounded-xl px-4 py-2.5 flex flex-col items-center gap-1 group-hover:shadow-xs group-hover:border-blue-400 transition-all">
                      <Camera className="w-5 h-5 text-blue-600 stroke-[1.8]" />
                      <span className="text-[11px] font-semibold text-slate-700">
                        Tambah Gambar
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                Format: JPG/PNG/WebP, maksimal 2 MB
              </p>
            </div>

            {/* Card 2: Karakteristik Dokumen */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Karakteristik Dokumen
              </h2>

              {/* Bahasa Monograf */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Bahasa Monograf
                </label>
                <div className="relative">
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full appearance-none bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8"
                  >
                    <option value="ind - Bahasa Indonesia">ind - Bahasa Indonesia</option>
                    <option value="eng - Bahasa Inggris">eng - Bahasa Inggris</option>
                    <option value="ban - Bahasa Bali">ban - Bahasa Bali</option>
                    <option value="jav - Bahasa Jawa">jav - Bahasa Jawa</option>
                    <option value="ara - Bahasa Arab">ara - Bahasa Arab</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Bentuk Karya Tulis */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Bentuk Karya Tulis
                </label>
                <div className="relative">
                  <select
                    value={formData.literaryForm}
                    onChange={(e) => handleInputChange('literaryForm', e.target.value)}
                    className="w-full appearance-none bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8"
                  >
                    <option value="0 - Bukan fiksi atau tidak didefinisikan">
                      0 - Bukan fiksi atau tidak didefinisikan
                    </option>
                    <option value="1 - Fiksi (Novel, Cerpen, Dongeng)">
                      1 - Fiksi (Novel, Cerpen, Dongeng)
                    </option>
                    <option value="d - Drama / Naskah Lakon">
                      d - Drama / Naskah Lakon
                    </option>
                    <option value="e - Esai & Karya Kritis">
                      e - Esai &amp; Karya Kritis
                    </option>
                    <option value="p - Puisi / Sajak">p - Puisi / Sajak</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Kelompok Sasaran (Audience) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Kelompok Sasaran (Audience)
                </label>
                <div className="relative">
                  <select
                    value={formData.audience}
                    onChange={(e) => handleInputChange('audience', e.target.value)}
                    className="w-full appearance-none bg-[#F0F4FA] border border-slate-200/60 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer pr-8"
                  >
                    <option value="Tidak diketahui">Tidak diketahui</option>
                    <option value="Dewasa / Umum">Dewasa / Umum</option>
                    <option value="Remaja (SLTP/SLTA)">Remaja (SLTP/SLTA)</option>
                    <option value="Anak-Anak (SD)">Anak-Anak (SD)</option>
                    <option value="Balita / Prasekolah">Balita / Prasekolah</option>
                    <option value="Akademisi / Peneliti">Akademisi / Peneliti</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Card 3: Penayangan & Visibilitas */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
              <h2 className="text-sm font-bold text-[#0B2256]">
                Penayangan &amp; Visibilitas
              </h2>

              {/* Checkbox Card 1: OPAC Publik */}
              <div
                onClick={() =>
                  setFormData((prev) => ({ ...prev, showInOpac: !prev.showInOpac }))
                }
                className="p-3 rounded-xl border border-slate-200/60 bg-[#F0F4FA] transition-all cursor-pointer flex items-start gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={formData.showInOpac}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#0B2256] block">
                    Tampil di OPAC Publik
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Monograf dapat ditelusuri siswa melalui anjungan OPAC perpustakaan sekolah.
                  </p>
                </div>
              </div>

              {/* Checkbox Card 2: Masuk Keranjang Karantina */}
              <div
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isQuarantine: !prev.isQuarantine,
                  }))
                }
                className="p-3 rounded-xl border border-red-100 bg-[#FFF5F5] transition-all cursor-pointer flex items-start gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={formData.isQuarantine}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-red-700 block">
                    Masuk Keranjang Karantina
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tahan katalog dari peredaran sirkulasi jika data fisik belum selesai diverifikasi.
                  </p>
                </div>
              </div>

              {/* Metadata Summary Info */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Penginput:</span>
                  <span className="font-bold text-slate-800">{formData.authorAdmin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Waktu Pembuatan:</span>
                  <span className="text-slate-700">{formData.createdAtFormatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status Terbitan:</span>
                  <span className="font-bold text-[#059669]">{formData.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR (Exact match to screenshot)             */}
        {/* ========================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          {/* Left: Autosave Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>
              Autosave otomatis aktif • Tersimpan {lastSavedMinutes} menit lalu
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin membatalkan perubahan entri ini?')) {
                  window.history.back()
                }
              }}
              className="px-4 py-1.5 bg-[#EDF2F7] hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleCopyTitle}
              className="px-3.5 py-1.5 bg-[#DCE9FE] hover:bg-blue-200 text-[#1E40AF] text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Salin Judul
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="px-4 py-1.5 bg-[#FEE8D6] hover:bg-amber-200 text-[#C2410C] text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Selesai
            </button>

            <button
              type="button"
              onClick={handleSaveCatalog}
              className="px-4 py-1.5 bg-[#007A64] hover:bg-[#006452] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Simpan Katalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Marc21Modal
        isOpen={isMarcModalOpen}
        onClose={() => setIsMarcModalOpen(false)}
        formData={formData}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <CopyCatalogModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        onSelectCatalog={handleSelectCopyCatalog}
      />
    </AdminLayout>
  )
}
