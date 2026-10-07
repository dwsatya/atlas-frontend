import ktaDepanTemplate from '../assets/KTA Depan Template.png'
import ktaBelakang from '../assets/KTA Belakang.png'
import { generateCode128, formatValidityDate } from '../components/KtaCard'

/**
 * Normalisasi URL foto agar selalu mengarah ke storage backend yang valid
 */
export function resolvePhotoUrl(photo) {
  if (!photo) return null
  if (typeof photo !== 'string') return photo
  if (photo.startsWith('blob:') || photo.startsWith('data:')) return photo

  // Koreksi jika URL lama tidak sengaja memuat /profile-photos/ tanpa /storage/
  if (photo.includes('/profile-photos/') && !photo.includes('/storage/profile-photos/')) {
    return photo.replace('/profile-photos/', '/storage/profile-photos/')
  }

  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const cleaned = photo.replace(/^\/+/, '')
  if (cleaned.startsWith('storage/')) {
    return `${backendUrl}/${cleaned}`
  }
  return `${backendUrl}/storage/${cleaned}`
}

/**
 * Helper untuk memuat Image HTML secara async
 */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = async () => {
      // Fallback jika CORS standard gagal: fetch sebagai Blob
      try {
        const res = await fetch(src)
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const fbImg = new Image()
        fbImg.onload = () => resolve(fbImg)
        fbImg.onerror = () => resolve(null)
        fbImg.src = blobUrl
      } catch {
        resolve(null)
      }
    }
    img.src = src
  })
}

/**
 * Menggambar sisi depan KTA ke canvas HTML5 (Resolusi 1004 x 636)
 */
async function drawKtaFront(ctx, { memberNo, name, photo, createdAt, locationName }) {
  const validUntil = formatValidityDate(createdAt)
  const templateImg = await loadImage(ktaDepanTemplate)
  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, 1004, 636)
  }

  // 1. Tutupi kotak abu-abu template foto dengan kotak putih bersih
  // Area template foto: left 7.07% (71px), top 34.43% (219px), w 22.61% (227px), h 34.28% (218px)
  const boxX = 71
  const boxY = 219
  const boxW = 227
  const boxH = 218

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(boxX, boxY, boxW, boxH)

  // 2. Gambar pasfoto anggota dengan rasio 2:3 (lebar : tinggi = 2 : 3)
  // Tinggi = 218px, Lebar = 218 * (2/3) = 145.3px
  const photoW = Math.round(boxH * (2 / 3))
  const photoH = boxH
  const photoX = Math.round(boxX + (boxW - photoW) / 2)
  const photoY = boxY

  const resolvedPhotoUrl = resolvePhotoUrl(photo)
  const photoImg = resolvedPhotoUrl ? await loadImage(resolvedPhotoUrl) : null

  if (photoImg) {
    // Crop center/top dengan rasio 2:3
    const targetAspect = 2 / 3
    const imgAspect = photoImg.naturalWidth / photoImg.naturalHeight
    let sW, sH, sX, sY
    if (imgAspect > targetAspect) {
      sH = photoImg.naturalHeight
      sW = Math.round(photoImg.naturalHeight * targetAspect)
      sX = Math.round((photoImg.naturalWidth - sW) / 2)
      sY = 0
    } else {
      sW = photoImg.naturalWidth
      sH = Math.round(photoImg.naturalWidth / targetAspect)
      sX = 0
      sY = 0 // Pertahankan bagian atas (wajah)
    }

    ctx.drawImage(photoImg, sX, sY, sW, sH, photoX, photoY, photoW, photoH)
    // Garis batas halus pasfoto
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1
    ctx.strokeRect(photoX, photoY, photoW, photoH)
  } else {
    // Placeholder pasfoto jika belum ada foto
    ctx.fillStyle = '#F1F5F9'
    ctx.fillRect(photoX, photoY, photoW, photoH)
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1
    ctx.strokeRect(photoX, photoY, photoW, photoH)

    ctx.fillStyle = '#64748B'
    ctx.font = 'bold 15px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Pasfoto 2:3', photoX + photoW / 2, photoY + photoH / 2)
  }

  // 3. Tulis Teks Data Anggota (Tepat di sebelah kanan titik dua)
  ctx.fillStyle = '#0F172A'
  ctx.font = '600 25px Arial, "Segoe UI", sans-serif'
  ctx.textAlign = 'left'

  const textLeft = 572
  ctx.fillText(memberNo || '-', textLeft, 248)
  ctx.fillText(name || '-', textLeft, 295)
  ctx.fillText(locationName || 'Perpustakaan Daerah', textLeft, 342)
  ctx.fillText(validUntil, textLeft, 428)

  // 4. Barcode Code 128
  const barcodeBoxX = 173
  const barcodeBoxY = 483
  const barcodeBoxW = 476
  const barcodeBoxH = 113

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(barcodeBoxX, barcodeBoxY, barcodeBoxW, barcodeBoxH)

  const barcodeData = generateCode128(memberNo || 'MEM-000000-0000')
  const availableBarWidth = 440
  const unitW = availableBarWidth / barcodeData.width
  const barStartX = barcodeBoxX + (barcodeBoxW - availableBarWidth) / 2
  const barY = 492
  const barH = 72

  ctx.fillStyle = '#000000'
  barcodeData.bars.forEach((bar) => {
    ctx.fillRect(Math.round(barStartX + bar.x * unitW), barY, Math.max(1, Math.round(bar.w * unitW)), barH)
  })

  // Nomor anggota di bawah garis barcode
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000000'
  ctx.fillText(memberNo || '', barcodeBoxX + barcodeBoxW / 2, 584)
}

/**
 * Menggambar sisi belakang KTA ke canvas HTML5 (Resolusi 1004 x 636)
 */
async function drawKtaBack(ctx) {
  const templateImg = await loadImage(ktaBelakang)
  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, 1004, 636)
  }
}

/**
 * Unduh KTA dalam format Gambar (PNG)
 * @param {'depan' | 'belakang' | 'keduanya'} side
 */
export async function downloadKtaImage({
  side = 'depan',
  memberNo = 'MEM-202610-0001',
  name = 'Anggota ATLAS',
  photo = null,
  createdAt = null,
  locationName = 'Perpustakaan Daerah',
}) {
  const safeMemberNo = (memberNo || 'KTA').replace(/[^a-zA-Z0-9_-]/g, '_')

  if (side === 'depan') {
    const canvas = document.createElement('canvas')
    canvas.width = 1004
    canvas.height = 636
    const ctx = canvas.getContext('2d')

    await drawKtaFront(ctx, { memberNo, name, photo, createdAt, locationName })

    triggerDownload(canvas, `KTA-Depan-${safeMemberNo}.png`)
  } else if (side === 'belakang') {
    const canvas = document.createElement('canvas')
    canvas.width = 1004
    canvas.height = 636
    const ctx = canvas.getContext('2d')

    await drawKtaBack(ctx)

    triggerDownload(canvas, `KTA-Belakang-${safeMemberNo}.png`)
  } else if (side === 'keduanya') {
    // Gabungan kedua sisi (atas: depan, bawah: belakang) dengan resolusi tinggi
    const canvas = document.createElement('canvas')
    canvas.width = 1004
    canvas.height = 1320
    const ctx = canvas.getContext('2d')

    // Background putih
    ctx.fillStyle = '#F8FAFC'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Sisi Depan
    ctx.save()
    await drawKtaFront(ctx, { memberNo, name, photo, createdAt, locationName })
    ctx.restore()

    // Sisi Belakang di bawah
    ctx.save()
    ctx.translate(0, 684) // 636 + 48px gap
    await drawKtaBack(ctx)
    ctx.restore()

    triggerDownload(canvas, `KTA-Lengkap-Depan-Belakang-${safeMemberNo}.png`)
  }
}

function triggerDownload(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
