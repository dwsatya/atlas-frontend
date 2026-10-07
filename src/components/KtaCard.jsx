import { useState, useMemo, useEffect } from 'react'
import ktaDepanTemplate from '../assets/KTA Depan Template.png'
import ktaBelakang from '../assets/KTA Belakang.png'
import { resolvePhotoUrl } from '../utils/ktaImageGenerator'

/**
 * Code 128 (Subset B) SVG Barcode Generator
 * Generates an exact, crisp vector barcode for any member number without external dependencies
 */
export function generateCode128(text) {
  const safeText = String(text || 'MEM-000000-0000').trim()
  const patterns = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
  ]

  let checksum = 104
  let codeStr = patterns[104] // Start Code B

  for (let i = 0; i < safeText.length; i++) {
    const charCode = safeText.charCodeAt(i)
    const code = (charCode >= 32 && charCode <= 126) ? charCode - 32 : 0
    checksum += code * (i + 1)
    codeStr += patterns[code]
  }

  const checkCode = checksum % 103
  codeStr += patterns[checkCode]
  codeStr += patterns[106] // Stop Code

  let x = 0
  const bars = []
  let isBar = true
  for (let i = 0; i < codeStr.length; i++) {
    const w = parseInt(codeStr[i], 10)
    if (isBar) {
      bars.push({ x, w })
    }
    x += w
    isBar = !isBar
  }

  return { width: x, bars }
}

/**
 * Format validity date (5 years from registration / created_at date)
 */
export function formatValidityDate(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : new Date()
    if (isNaN(d.getTime())) return '13-12-2031'
    d.setFullYear(d.getFullYear() + 5)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return '13-12-2031'
  }
}

/**
 * Komponen Sisi Depan KTA
 */
export function KtaFront({
  memberNo = '242342342',
  name = 'Dewa Made Satya',
  photo = null,
  createdAt = null,
  locationName = 'Perpustakaan Daerah',
  className = '',
}) {
  const [imgError, setImgError] = useState(false)
  const validUntil = useMemo(() => formatValidityDate(createdAt), [createdAt])
  const barcodeData = useMemo(() => generateCode128(memberNo), [memberNo])
  const resolvedPhoto = useMemo(() => resolvePhotoUrl(photo), [photo])

  useEffect(() => {
    setImgError(false)
  }, [resolvedPhoto])

  return (
    <div
      className={`relative w-full aspect-[1004/636] rounded-2xl overflow-hidden bg-white select-none ${className}`}
      style={{
        containerType: 'inline-size',
      }}
    >
      {/* Background Template KTA Depan */}
      <img
        src={ktaDepanTemplate}
        alt="Template KTA Depan Perpustakaan Daerah Buleleng"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* 1. Pasfoto Anggota 2:3 (Area template ditutup putih, foto di-center dengan rasio 2:3 tanpa border & shadow) */}
      <div
        className="absolute flex items-center justify-center bg-white overflow-hidden"
        style={{
          left: '6.87%',
          top: '34.12%',
          width: '17.23%',
          height: '35.06%',
        }}
      >
        <div className="h-full aspect-[2/3] overflow-hidden bg-white flex items-center justify-center">
          {resolvedPhoto && !imgError ? (
            <img
              src={resolvedPhoto}
              alt={name}
              className="w-full h-full object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-1 text-slate-400 font-medium leading-tight">
              <svg
                className="w-[3cqw] h-[3cqw] text-slate-300 mb-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span style={{ fontSize: '1.2cqw' }}>Pasfoto 2:3</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Text Data Anggota (Tepat di sebelah kanan tanda titik dua ':' pada x=540px / 53.8%) */}
      {/* Field 1: Nomor */}
      <div
        className="absolute font-semibold text-slate-900 truncate"
        style={{
          left: '57.0%',
          top: '36.2%',
          fontSize: '2.6cqw',
          lineHeight: '1.2',
          maxWidth: '40%',
        }}
        title={memberNo}
      >
        {memberNo}
      </div>

      {/* Field 2: Nama */}
      <div
        className="absolute font-semibold text-slate-900 truncate"
        style={{
          left: '57.0%',
          top: '43.6%',
          fontSize: '2.6cqw',
          lineHeight: '1.2',
          maxWidth: '40%',
        }}
        title={name}
      >
        {name}
      </div>

      {/* Field 3: Lokasi Perpustakaan */}
      <div
        className="absolute font-semibold text-slate-900 truncate"
        style={{
          left: '57.0%',
          top: '51.0%',
          fontSize: '2.6cqw',
          lineHeight: '1.2',
          maxWidth: '40%',
        }}
        title={locationName}
      >
        {locationName}
      </div>

      {/* Field 4: Berlaku Hingga */}
      <div
        className="absolute font-semibold text-slate-900 truncate"
        style={{
          left: '57.0%',
          top: '64.4%',
          fontSize: '2.6cqw',
          lineHeight: '1.2',
          maxWidth: '40%',
        }}
      >
        {validUntil}
      </div>

      {/* 3. Barcode Anggota (Presisi di area kotak barcode tanpa border & shadow) */}
      <div
        className="absolute flex flex-col items-center justify-center bg-white px-1.5 py-0.5"
        style={{
          left: '17.03%',
          top: '75.63%',
          width: '47.91%',
          height: '18.55%',
        }}
      >
        {/* Garis Barcode SVG Code 128 */}
        <div className="w-full h-[68%] flex items-center justify-center">
          <svg
            viewBox={`0 0 ${barcodeData.width} 44`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {barcodeData.bars.map((bar, idx) => (
              <rect
                key={idx}
                x={bar.x}
                y={0}
                width={bar.w}
                height={44}
                fill="#000000"
              />
            ))}
          </svg>
        </div>

        {/* Teks Nomor Anggota di Bawah Barcode */}
        <div
          className="text-center font-mono font-bold tracking-wider text-black leading-none mt-0.5 truncate max-w-full"
          style={{ fontSize: '1.9cqw' }}
        >
          {memberNo}
        </div>
      </div>
    </div>
  )
}

/**
 * Komponen Sisi Belakang KTA
 */
export function KtaBack({ className = '' }) {
  return (
    <div
      className={`relative w-full aspect-[1004/636] rounded-2xl overflow-hidden bg-white select-none ${className}`}
    >
      <img
        src={ktaBelakang}
        alt="Tata Tertib Kartu Anggota Perpustakaan Daerah Buleleng"
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  )
}

/**
 * Komponen Interaktif KTA Card dengan 3D Flip & Tombol Aksi
 */
export default function KtaCard({
  memberNo = '242342342',
  name = 'Dewa Made Satya',
  photo = null,
  createdAt = null,
  locationName = 'Perpustakaan Daerah',
  onPrint = null,
  onDownload = null,
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e?.stopPropagation()
    if (!memberNo) return
    navigator.clipboard.writeText(memberNo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload()
    } else if (onPrint) {
      onPrint()
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 1. Header KTA & Toggle Sisi */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#032360] text-sm sm:text-base">
            Kartu Anggota Digital (KTA)
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
            ✓ Aktif
          </span>
        </div>

        {/* Tab Switcher: Depan / Belakang */}
        <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center text-xs font-bold">
          <button
            type="button"
            onClick={() => setIsFlipped(false)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              !isFlipped
                ? 'bg-white text-[#002B66] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Depan
          </button>
          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              isFlipped
                ? 'bg-white text-[#002B66] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belakang
          </button>
        </div>
      </div>

      {/* 2. 3D Flip Card Container */}
      <div
        className="relative w-full cursor-pointer select-none group"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped((prev) => !prev)}
        title="Klik untuk membalik kartu (Depan / Belakang)"
      >
        {/* Flip Inner Box */}
        <div
          className="relative w-full aspect-[1004/636] transition-transform duration-700 rounded-2xl shadow-xl hover:shadow-2xl"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ================= SISI DEPAN ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-slate-200/80"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <KtaFront
              memberNo={memberNo}
              name={name}
              photo={photo}
              createdAt={createdAt}
              locationName={locationName}
            />
          </div>

          {/* ================= SISI BELAKANG ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-slate-200/80"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <KtaBack />
          </div>
        </div>
      </div>

      {/* 3. Petunjuk & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Klik kartu untuk membalik sisi</span>
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Tombol Balik Kartu */}
          <button
            type="button"
            onClick={() => setIsFlipped((prev) => !prev)}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#002B66] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isFlipped ? 'Lihat Depan' : 'Balik Kartu'}</span>
          </button>

          {/* Tombol Salin Nomor */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            title="Salin Nomor Anggota"
          >
            <svg className="w-3.5 h-3.5 text-[#002B66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copied ? 'Tersalin!' : 'Salin Nomor'}</span>
          </button>

          {/* Tombol Unduh KTA */}
          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[#002B66] hover:bg-[#001D48] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            title="Unduh Gambar Kartu Tanda Anggota"
          >
            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh KTA</span>
          </button>
        </div>
      </div>
    </div>
  )
}


