import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { getBookCoverUrl } from '../utils/bookCover'

/**
 * Sampul buku: tampilkan gambar bila tersedia, selain itu (atau bila gagal dimuat) ikon "No Image".
 */
export default function BookCover({ book, className = '', iconClassName = 'w-7 h-7', labelClassName = 'text-[11px]' }) {
  const src = getBookCoverUrl(book)
  const [failedSrc, setFailedSrc] = useState(null)

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={`Sampul ${book?.title || 'buku'}`}
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={`object-cover bg-slate-100 ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`Sampul ${book?.title || 'buku'} tidak tersedia`}
      className={`bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400 select-none ${className}`}
    >
      <ImageOff className={iconClassName} strokeWidth={1.6} />
      <span className={`font-semibold tracking-wide ${labelClassName}`}>No Image</span>
    </div>
  )
}
