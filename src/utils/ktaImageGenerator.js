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
    photo = photo.replace('/profile-photos/', '/storage/profile-photos/')
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
 * Helper untuk memuat Image HTML secara async dan tahan CORS
 * Menggunakan strategi multi-fallback (Blob URL via Vite proxy, backend CORS /api/storage/, dan direct Image)
 */
export async function loadImage(src) {
  if (!src) return null

  // 1. Jika data URL atau Blob URL, langsung load
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    })
  }

  // 2. Siapkan daftar kandidat URL
  const candidateUrls = []

  if (src.includes('/storage/')) {
    const storagePath = src.split('/storage/')[1]
    // a. Relative path via Vite dev server proxy (same-origin, 100% bebas CORS di browser)
    candidateUrls.push(`/storage/${storagePath}`)
    // b. Endpoint publik Laravel dengan header Access-Control-Allow-Origin: *
    candidateUrls.push(`http://localhost:8000/api/storage/${storagePath}`)
    // c. Direct localhost:8000 storage
    candidateUrls.push(`http://localhost:8000/storage/${storagePath}`)
  }

  if (!candidateUrls.includes(src)) {
    candidateUrls.push(src)
  }

  // 3. Coba unduh via fetch -> Blob URL terlebih dahulu agar tidak menodai (taint) Canvas
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (res.ok) {
        const blob = await res.blob()
        if (blob && blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob)
          const img = await new Promise((resolve) => {
            const i = new Image()
            i.onload = () => resolve(i)
            i.onerror = () => resolve(null)
            i.src = blobUrl
          })
          if (img) return img
        }
      }
    } catch {
      // Lanjut coba kandidat URL berikutnya jika fetch gagal
    }

    // Fallback coba via Image dengan crossOrigin anonymous
    try {
      const img = await new Promise((resolve) => {
        const i = new Image()
        i.crossOrigin = 'anonymous'
        i.onload = () => resolve(i)
        i.onerror = () => resolve(null)
        i.src = url
      })
      if (img) return img
    } catch {
      // Lanjut
    }
  }

  return null
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

  // 1. Tutupi area kotak abu-abu template foto dengan kotak putih bersih
  // Template foto asli: X=71..239 (w:169), Y=219..437 (h:219).
  // Tutupi dengan margin +2px ke setiap sisi (X:69, Y:217, W:173, H:223) agar tidak ada garis/shadow abu-abu tersisa.
  const coverPhotoX = 69
  const coverPhotoY = 217
  const coverPhotoW = 173
  const coverPhotoH = 223

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(coverPhotoX, coverPhotoY, coverPhotoW, coverPhotoH)

  // 2. Gambar pasfoto anggota dengan rasio 2:3 (lebar : tinggi = 2 : 3)
  // Tinggi = 219px (tinggi slot asli), Lebar = 219 * (2/3) = 146px
  const photoH = 219
  const photoW = Math.round(photoH * (2 / 3))
  const photoX = Math.round(71 + (169 - photoW) / 2)
  const photoY = 219

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
      sY = 0 // Fokus wajah bagian atas
    }

    // Gambar pasfoto langsung tanpa border atau shadow (bersih sesuai permintaan)
    ctx.drawImage(photoImg, sX, sY, sW, sH, photoX, photoY, photoW, photoH)
  } else {
    // Placeholder pasfoto jika belum ada foto (tanpa shadow/border)
    ctx.fillStyle = '#F8FAFC'
    ctx.fillRect(photoX, photoY, photoW, photoH)

    ctx.fillStyle = '#94A3B8'
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
  // Template barcode asli: X=173..649 (w:477), Y=483..596 (h:114).
  // Tutupi dengan margin +2px ke setiap sisi (X:171, Y:481, W:481, H:118) agar tidak ada garis/shadow abu-abu tersisa.
  const barcodeBoxX = 171
  const barcodeBoxY = 481
  const barcodeBoxW = 481
  const barcodeBoxH = 118

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(barcodeBoxX, barcodeBoxY, barcodeBoxW, barcodeBoxH)

  const barcodeData = generateCode128(memberNo || 'MEM-000000-0000')
  const availableBarWidth = 440
  const unitW = availableBarWidth / barcodeData.width
  const barStartX = 173 + (477 - availableBarWidth) / 2
  const barY = 492
  const barH = 72

  ctx.fillStyle = '#000000'
  barcodeData.bars.forEach((bar) => {
    ctx.fillRect(Math.round(barStartX + bar.x * unitW), barY, Math.max(1, Math.round(bar.w * unitW)), barH)
  })

  // Nomor anggota di bawah garis barcode (tanpa shadow/border)
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000000'
  ctx.fillText(memberNo || '', 173 + 477 / 2, 584)
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
