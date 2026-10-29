import { useNavigate, useLocation } from 'react-router-dom'
import { BookMarked, BookOpenCheck, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notifyLoginRequired } from '../utils/notification'

/**
 * Menu Layanan Mandiri anggota — satu sumber untuk dropdown Navbar
 * dan kartu sidebar di Beranda & OPAC agar isinya selalu seragam.
 */
export const LAYANAN_MANDIRI_ITEMS = [
  {
    key: 'reservasi',
    label: 'Reservasi Saya',
    description: 'Status & kode reservasi buku',
    path: '/reservasi-saya',
    icon: BookMarked,
    tone: 'bg-indigo-100/80 text-indigo-700',
    requiresLogin: true,
  },
  {
    key: 'pinjaman',
    label: 'Pinjaman Saya',
    description: 'Jatuh tempo & estimasi denda',
    path: '/pinjaman-saya',
    icon: BookOpenCheck,
    tone: 'bg-emerald-100/80 text-emerald-700',
    requiresLogin: true,
  },
  {
    key: 'favorit',
    label: 'Buku Favorit',
    description: 'Koleksi yang Anda tandai bintang',
    path: '/opac?favorit=1',
    icon: Star,
    tone: 'bg-amber-100/80 text-amber-600',
    requiresLogin: true,
  },
]

export function useLayananMandiri() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isLoggedIn = Boolean(user && localStorage.getItem('atlas_token'))

  const isActive = (item) => {
    const [pathname, query] = item.path.split('?')
    if (location.pathname !== pathname) return false
    return query ? location.search.includes(query) : !location.search.includes('favorit=1')
  }

  const open = (item) => {
    if (item.requiresLogin && !isLoggedIn) {
      const [pathname, query] = item.path.split('?')
      notifyLoginRequired(`Wajib Login terlebih dahulu untuk membuka ${item.label}.`)
      navigate('/login', { state: { from: { pathname, search: query ? `?${query}` : '' } } })
      return
    }
    navigate(item.path)
  }

  return { isLoggedIn, user, isActive, open, navigate }
}
