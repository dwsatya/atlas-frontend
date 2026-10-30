import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Loader2, Check, Square } from 'lucide-react'
import { prepareCatalogImport, processCatalogImportChunk, cancelCatalogImport } from '../../services/api'

const DAPD_TEMPLATE_COLUMNS = [
  'NO', 'TGL PENGADAAN', 'NO. INDUK', 'NO. BARCODE', 'NO. RFID', 'JENIS SUMBER', 'NAMA SUMBER', 'MATA UANG', 'HARGA',
  'KODE LOKASI', 'KODE', 'AKSES', 'KATEGORI', 'MEDIA', 'KETERSEDIAAN', 'NOMOR PANGGIL', 'JENIS BAHAN', 'JUDUL UTAMA',
  'ANAK JUDUL', 'PERNYATAAN', 'TAJUK PENGARANG', 'TAJUK PENGARANG', 'PENGARANG', 'PENGARANG', 'EDISI', 'KOTA TERBIT',
  'PENERBIT', 'TAHUN', 'JUMLAH', 'DIMENSI', 'ISBN', 'ISSN', 'ISMN', 'NO DDC', 'NOMOR PANGGIL', 'ABSTRAK', 'BAHASA',
  'SUBJEK TOPIK', 'EDISI SERIAL', 'TGL TERBIT EDISI', 'BAHAN SERTAAN', 'KETERANGAN LAIN', 'EKS',
]

const MAX_MESSAGES = 50

// Tahapan import: idle -> uploading -> reading -> saving -> done | cancelled | error
const ACTIVE_PHASES = ['uploading', 'reading', 'saving']

const STEPS = [
  { key: 'uploading', label: 'Unggah File' },
  { key: 'reading', label: 'Baca Excel' },
  { key: 'saving', label: 'Simpan ke Database' },
]

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDuration = (seconds) => {
  if (seconds === null || !Number.isFinite(seconds)) return null
  if (seconds < 60) return `±${Math.max(1, Math.round(seconds))} detik`
  return `±${Math.round(seconds / 60)} menit`
}

const EMPTY_PROGRESS = { processed: 0, total: 0, chunk: 0, totalChunks: 0, etaSeconds: null }

export default function ImportExcelModal({ isOpen, onClose, onImportSuccess }) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [uploadPercent, setUploadPercent] = useState(0)
  const [progress, setProgress] = useState(EMPTY_PROGRESS)
  const [statusMessage, setStatusMessage] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const stopRequestedRef = useRef(false)
  const [stopRequested, setStopRequested] = useState(false)

  const isProcessing = ACTIVE_PHASES.includes(phase)

  // Peringatkan bila halaman ditutup/dimuat ulang saat import masih berjalan
  useEffect(() => {
    if (!isProcessing) return undefined
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isProcessing])

  if (!isOpen) return null

  const resetState = () => {
    setStatusMessage(null)
    setImportResult(null)
    setPhase('idle')
    setUploadPercent(0)
    setProgress(EMPTY_PROGRESS)
  }

  const handleClose = () => {
    if (isProcessing) return
    onClose()
    resetState()
    setSelectedFile(null)
  }

  const selectFile = (file) => {
    if (isProcessing || !file) return
    setSelectedFile(file)
    resetState()
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    selectFile(e.dataTransfer.files?.[0])
  }

  const handleFileChange = (e) => {
    selectFile(e.target.files?.[0])
    e.target.value = ''
  }

  // Berhenti setelah blok yang sedang diproses selesai (blok itu sendiri tidak terpotong)
  const handleStop = () => {
    stopRequestedRef.current = true
    setStopRequested(true)
  }

  const handleProcessImport = async () => {
    if (!selectedFile || isProcessing) return
    stopRequestedRef.current = false
    setStopRequested(false)
    resetState()
    setPhase('uploading')

    // Tahap 1 & 2: unggah file lalu server membaca seluruh sheet
    let prepared
    try {
      const res = await prepareCatalogImport(selectedFile, (percent) => {
        setUploadPercent(percent)
        if (percent >= 100) setPhase('reading')
      })
      prepared = res.data
    } catch (err) {
      setPhase('error')
      setImportResult(err?.data?.data || null)
      setStatusMessage({ type: 'error', text: err?.message || 'Gagal membaca file Excel.' })
      return
    }

    const summary = {
      detected_format: prepared.detected_format,
      total_rows: prepared.total_rows,
      skipped_rows: prepared.skipped_rows,
      catalogs_created: 0,
      catalogs_matched: 0,
      collections_created: 0,
      duplicate_barcodes: 0,
      sheets: prepared.sheets.map((sheet) => ({ ...sheet, collections_created: 0 })),
      errors: [...(prepared.errors || [])],
      warnings: [...(prepared.warnings || [])],
    }

    setPhase('saving')
    setImportResult({ ...summary })
    setProgress({ ...EMPTY_PROGRESS, total: prepared.total_rows, totalChunks: prepared.total_chunks })

    // Tahap 3: simpan per blok agar progress bisa diperbarui setelah setiap blok
    const startedAt = performance.now()
    let finalPhase = 'done'
    let failureMessage = null

    for (let chunk = 0; chunk < prepared.total_chunks; chunk++) {
      if (stopRequestedRef.current) {
        await cancelCatalogImport(prepared.token)
        finalPhase = 'cancelled'
        break
      }

      let data
      try {
        data = (await processCatalogImportChunk(prepared.token, chunk)).data
      } catch (err) {
        await cancelCatalogImport(prepared.token)
        finalPhase = 'error'
        failureMessage = err?.message || 'Gagal menyimpan data ke database.'
        break
      }

      summary.catalogs_created += data.catalogs_created
      summary.catalogs_matched += data.catalogs_matched
      summary.collections_created += data.collections_created
      summary.duplicate_barcodes += data.duplicate_barcodes
      summary.errors = [...summary.errors, ...data.errors].slice(0, MAX_MESSAGES)
      summary.warnings = [...summary.warnings, ...data.warnings].slice(0, MAX_MESSAGES)
      summary.sheets = summary.sheets.map((sheet) => ({
        ...sheet,
        collections_created: sheet.collections_created + (data.sheet_collections?.[sheet.name] || 0),
      }))

      const processed = Math.min((chunk + 1) * prepared.chunk_size, prepared.total_rows)
      const elapsedSeconds = (performance.now() - startedAt) / 1000
      const etaSeconds = processed > 0 ? ((prepared.total_rows - processed) * elapsedSeconds) / processed : null

      setProgress({
        processed,
        total: prepared.total_rows,
        chunk: chunk + 1,
        totalChunks: prepared.total_chunks,
        etaSeconds,
      })
      setImportResult({ ...summary })
    }

    setPhase(finalPhase)

    const imported = summary.collections_created
    const issues = summary.errors.length + summary.warnings.length

    if (finalPhase === 'done') {
      setStatusMessage({
        type: imported > 0 ? 'success' : 'error',
        text:
          imported > 0
            ? `Berhasil mengimpor ${formatNumber(imported)} eksemplar (${formatNumber(summary.catalogs_created)} judul baru, ${formatNumber(summary.catalogs_matched)} judul sudah ada).`
            : 'Tidak ada data buku yang berhasil diimpor. Periksa catatan di bawah.',
      })
    } else if (finalPhase === 'cancelled') {
      setStatusMessage({
        type: 'error',
        text: `Import dihentikan. ${formatNumber(imported)} eksemplar yang sudah tersimpan sebelumnya tetap ada di database.`,
      })
    } else {
      setStatusMessage({
        type: 'error',
        text: `${failureMessage} ${formatNumber(imported)} eksemplar yang sudah tersimpan tetap ada di database.`,
      })
    }

    if (onImportSuccess && imported > 0) {
      onImportSuccess(summary)
    }

    // Tutup otomatis hanya bila impor bersih tanpa catatan; jika ada catatan, biarkan admin membacanya
    if (finalPhase === 'done' && imported > 0 && issues === 0) {
      setTimeout(() => {
        onClose()
        resetState()
        setSelectedFile(null)
      }, 2000)
    }
  }

  // Persentase keseluruhan: unggah 0-10%, baca file 10-15%, simpan 15-100%
  const overallPercent =
    phase === 'uploading'
      ? Math.round(uploadPercent * 0.1)
      : phase === 'reading'
        ? 12
        : phase === 'done'
          ? 100
          : progress.total > 0
            ? Math.round(15 + (progress.processed / progress.total) * 85)
            : 15

  const stepIndex = { uploading: 0, reading: 1, saving: 2 }[phase] ?? (phase === 'idle' ? -1 : 3)
  const showProgress = phase !== 'idle' && !(phase === 'error' && progress.total === 0)

  const progressLabel = {
    uploading: `Mengunggah file... ${uploadPercent}%`,
    reading: 'Membaca seluruh sheet Excel...',
    saving: `Menyimpan ke database: ${formatNumber(progress.processed)} / ${formatNumber(progress.total)} baris`,
    done: `Selesai: ${formatNumber(progress.total)} baris diproses`,
    cancelled: `Dihentikan pada ${formatNumber(progress.processed)} / ${formatNumber(progress.total)} baris`,
    error: `Terhenti pada ${formatNumber(progress.processed)} / ${formatNumber(progress.total)} baris`,
  }[phase]

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
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
            onClick={() => !isProcessing && document.getElementById('excelFileInput')?.click()}
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

          {showProgress && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-3">
              {/* Tahapan */}
              <div className="flex items-center">
                {STEPS.map((step, idx) => {
                  const done = stepIndex > idx
                  const active = stepIndex === idx && isProcessing
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : active
                                ? 'bg-[#0B2559] text-white'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {done ? <Check className="w-3 h-3" /> : active ? <Loader2 className="w-3 h-3 animate-spin" /> : idx + 1}
                        </span>
                        <span className={`text-[11px] font-semibold ${done || active ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <span className={`flex-1 h-px mx-2 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bar progress */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-slate-700">{progressLabel}</span>
                  <span className="font-extrabold text-[#0B2559]">{overallPercent}%</span>
                </div>
                <div
                  className="h-2.5 rounded-full bg-blue-100 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={overallPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      phase === 'done'
                        ? 'bg-emerald-500'
                        : phase === 'cancelled' || phase === 'error'
                          ? 'bg-amber-500'
                          : 'bg-[#0B2559]'
                    } ${phase === 'reading' ? 'animate-pulse' : ''}`}
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span>
                    {phase === 'reading'
                      ? 'Server sedang membaca file, mohon tunggu'
                      : progress.totalChunks > 0
                        ? `Blok ${formatNumber(progress.chunk)} dari ${formatNumber(progress.totalChunks)} • ${formatNumber(importResult?.collections_created)} eksemplar tersimpan`
                        : 'Menyiapkan unggahan'}
                  </span>
                  {phase === 'saving' && formatDuration(progress.etaSeconds) && (
                    <span className="shrink-0">Sisa {formatDuration(progress.etaSeconds)}</span>
                  )}
                </div>
              </div>

              {isProcessing && (
                <p className="text-[11px] text-blue-800">
                  Jangan menutup atau memuat ulang halaman ini selama proses berlangsung.
                </p>
              )}
            </div>
          )}

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

          {importResult && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 text-center">
                {[
                  { label: 'Eksemplar Masuk', value: importResult.collections_created || 0, tone: 'text-emerald-700' },
                  { label: 'Judul Baru', value: importResult.catalogs_created || 0, tone: 'text-[#0B2559]' },
                  {
                    label: 'Dilewati',
                    value: (importResult.duplicate_barcodes || 0) + (importResult.errors?.length || 0),
                    tone: 'text-amber-600',
                  },
                ].map((item) => (
                  <div key={item.label} className="py-2.5">
                    <p className={`text-lg font-extrabold ${item.tone}`}>{item.value}</p>
                    <p className="text-[10px] text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
              {importResult.detected_format && (
                <p className="px-3 py-2 border-t border-slate-200 text-[11px] text-slate-500">
                  Format terdeteksi: <b className="text-slate-700">{importResult.detected_format}</b>
                  {importResult.total_rows ? ` • ${importResult.total_rows} baris data dibaca` : ''}
                </p>
              )}
              {importResult.sheets?.length > 1 && (
                <ul className="px-3 py-2 border-t border-slate-200 space-y-1 text-[11px]">
                  {importResult.sheets.map((sheet) => (
                    <li key={sheet.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <FileSpreadsheet
                          className={`w-3.5 h-3.5 shrink-0 ${sheet.status === 'imported' ? 'text-emerald-600' : 'text-slate-400'}`}
                        />
                        <span className={`truncate ${sheet.status === 'imported' ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                          {sheet.name}
                        </span>
                      </span>
                      <span className={`shrink-0 ${sheet.status === 'imported' ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {sheet.status === 'imported'
                          ? `${sheet.collections_created} eksemplar dari ${sheet.rows} baris`
                          : 'Dilewati (bukan daftar buku)'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {[...(importResult.errors || []), ...(importResult.warnings || [])].length > 0 && (
                <ul className="max-h-36 overflow-y-auto px-3 py-2 border-t border-slate-200 space-y-1 text-[11px]">
                  {(importResult.errors || []).map((msg, idx) => (
                    <li key={`e-${idx}`} className="text-red-700 flex gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>{msg}</span>
                    </li>
                  ))}
                  {(importResult.warnings || []).map((msg, idx) => (
                    <li key={`w-${idx}`} className="text-amber-700 flex gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Download Template Guide */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Unduh Format Template</p>
              <p className="text-slate-500 text-[11px]">
                Format kolom Daftar Buku DAPD Buleleng (INLIS). Template lama ATLAS tetap didukung.
              </p>
            </div>
            <button
              onClick={() => {
                // Kolom sama persis dengan daftar buku Excel DAPD Buleleng (format INLIS)
                const csvHeader = DAPD_TEMPLATE_COLUMNS.map((col) => `"${col}"`).join(',') + '\n'
                // BOM UTF-8 agar Excel membaca karakter dengan benar
                const blob = new Blob(['﻿' + csvHeader], { type: 'text/csv;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'template_daftar_buku_dapd_buleleng.csv'
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
          {phase === 'saving' ? (
            <button
              onClick={handleStop}
              disabled={stopRequested}
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {stopRequested ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
              {stopRequested ? 'Menghentikan...' : 'Hentikan Import'}
            </button>
          ) : (
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {phase === 'done' || phase === 'cancelled' ? 'Tutup' : 'Batal'}
            </button>
          )}
          <button
            disabled={!selectedFile || isProcessing}
            onClick={handleProcessImport}
            className="px-5 py-2 bg-[#0B2559] hover:bg-[#07193c] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses {Math.max(overallPercent, 0)}%</span>
              </>
            ) : (
              <span>{phase === 'done' || phase === 'cancelled' || phase === 'error' ? 'Proses Ulang' : 'Proses Impor'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
