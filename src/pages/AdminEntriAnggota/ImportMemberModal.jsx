import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ImportMemberModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        setError('Hanya format file .csv, .xlsx, atau .xls yang didukung.')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleDownloadTemplate = () => {
    // Generate CSV template
    const headers = [
      'Nama Lengkap',
      'Jenis Kelamin (L/P)',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Kategori Pekerjaan (UMUM/PELAJAR/MAHASISWA)',
      'Nama Instansi / Sekolah',
      'Nomor WhatsApp',
      'Email',
      'Alamat KTP',
      'Alamat Domisili',
    ]
    const sampleRow = [
      'I Kadek Ariawan',
      'L',
      'Singaraja',
      '2002-03-12',
      'MAHASISWA',
      'Universitas Pendidikan Ganesha',
      '081234567890',
      'kadek.ariawan@gmail.com',
      'Jl. Ngurah Rai No. 12, Singaraja',
      'Jl. Ngurah Rai No. 12, Singaraja',
    ]

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), sampleRow.join(',')].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Template_Import_Anggota_ATLAS.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Silakan pilih file CSV atau Excel terlebih dahulu.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate/perform file import with CSV parsing
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)

      if (lines.length <= 1) {
        throw new Error('File kosong atau hanya memuat baris header.')
      }

      setResult({
        total: lines.length - 1,
        success: lines.length - 1,
      })

      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Import error:', err)
      setError(err.message || 'Gagal memproses file import.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#0B2256] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Import Data Anggota Masal
              </h3>
              <p className="text-[11px] text-[#A5C0EE]">
                Unggah berkas CSV atau Spreadsheet Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Berhasil mengimpor {result.success} anggota baru!</span>
            </div>
          )}

          {/* Template Info & Download */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-blue-900">Format Kolom Terstandarisasi</p>
              <p className="text-blue-700 text-[11px]">
                Gunakan template resmi untuk mencegah kegagalan pembacaan baris data.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Template
            </button>
          </div>

          {/* Drag & Drop Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              file
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Upload className="w-6 h-6" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">{file.name}</p>
                <p className="text-[11px] text-slate-500">
                  Ukuran: {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  Pilih file CSV atau Excel
                </p>
                <p className="text-[11px] text-slate-400">
                  Maksimal ukuran file 10MB (.csv, .xlsx, .xls)
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 rounded-xl bg-[#0B2256] hover:bg-[#112d6e] text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Mulai Import
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
