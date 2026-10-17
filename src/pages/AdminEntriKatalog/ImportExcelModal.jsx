import { useState } from 'react'
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { importAdminCatalogExcel } from '../../services/api'

export default function ImportExcelModal({ isOpen, onClose, onImportSuccess }) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  if (!isOpen) return null

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
      setStatusMessage(null)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setStatusMessage(null)
    }
  }

  const handleProcessImport = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setStatusMessage(null)

    try {
      const res = await importAdminCatalogExcel(selectedFile)
      const data = res?.data || {}
      const summaryText = data.catalogs_created !== undefined
        ? `Berhasil mengimpor ${data.catalogs_created} katalog baru dan ${data.collections_created || 0} eksemplar fisik ke database!`
        : `File "${selectedFile.name}" berhasil diunggah dan disimpan ke database perpustakaan.`

      setStatusMessage({
        type: 'success',
        text: summaryText,
      })

      if (onImportSuccess) {
        onImportSuccess(data)
      }

      setTimeout(() => {
        onClose()
        setStatusMessage(null)
        setSelectedFile(null)
      }, 1800)
    } catch (err) {
      console.error('Import error:', err)
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal memproses file Excel ke database.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B2559] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Impor Data Excel / RDA
              </h3>
              <p className="text-xs text-blue-200">
                Batch import atau impor otomatis metadata bibliografis ke database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-blue-400'
            }`}
            onClick={() => document.getElementById('excelFileInput')?.click()}
          >
            <input
              id="excelFileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                <Upload className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="font-bold text-slate-800 text-sm">{selectedFile.name}</p>
                  <p className="text-slate-500 text-[11px]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses ke server
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Tarik dan lepaskan file di sini
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Mendukung format file spreadsheet .XLSX, .XLS, atau .CSV (maksimal 10 MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Download Template Guide */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Unduh Format Template</p>
              <p className="text-slate-500 text-[11px]">
                Gunakan template standar perpustakaan daerah untuk mencegah ketidakcocokan kolom.
              </p>
            </div>
            <button
              onClick={() => {
                const csvHeader = 'title,subtitle,statement_of_responsibility,author_main,publisher,publish_city,publish_year,isbn,ddc_number,catalog_call_number\n'
                const blob = new Blob([csvHeader], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'template_entri_katalog_atlas.csv'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition cursor-pointer"
          >
            Batal
          </button>
          <button
            disabled={!selectedFile || isProcessing}
            onClick={handleProcessImport}
            className="px-5 py-2 bg-[#0B2559] hover:bg-[#07193c] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses ke Database...</span>
              </>
            ) : (
              <span>Proses Impor</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
