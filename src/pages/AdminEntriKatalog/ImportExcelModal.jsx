import { useState } from 'react'
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react'

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
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleProcessImport = () => {
    if (!selectedFile) return
    setIsProcessing(true)

    // Simulate import processing
    setTimeout(() => {
      setIsProcessing(false)
      setStatusMessage({
        type: 'success',
        text: `File "${selectedFile.name}" berhasil diunggah! 1 Katalog dimuat ke formulir entri.`,
      })
      if (onImportSuccess) {
        onImportSuccess({
          title: 'Metodologi Riset Terapan untuk Perpustakaan',
          subtitle: 'Panduan Praktis Pengelolaan Data Koleksi Digital',
          statementOfResponsibility: 'Ridwan Surasta, M.Hum. ; Editor: Komang Widiastuti',
          mainAuthor: 'Surasta, Ridwan',
          publisher: 'Penerbit Mahima',
          publishCity: 'Singaraja',
          publishYear: '2026',
          isbn: '978-623-999-102-1',
          ddcNumber: '025.04',
          callNumber: '025.04 SUR m',
        })
      }
      setTimeout(() => {
        onClose()
        setStatusMessage(null)
        setSelectedFile(null)
      }, 1400)
    }, 1200)
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
                Batch import atau impor otomatis metadata bibliografis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
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
              accept=".xlsx,.xls,.csv,.mrc"
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
                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Tarik dan lepaskan file di sini
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Mendukung format .XLSX, .XLS, .CSV, atau .MRC (ISO 2709)
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage.text}</span>
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
              onClick={() => alert('Mengunduh template_entri_katalog_atlas.xlsx')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh .XLSX</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition"
          >
            Batal
          </button>
          <button
            disabled={!selectedFile || isProcessing}
            onClick={handleProcessImport}
            className="px-5 py-2 bg-[#0B2559] hover:bg-[#07193c] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
          >
            {isProcessing ? 'Memproses...' : 'Proses Impor'}
          </button>
        </div>
      </div>
    </div>
  )
}
